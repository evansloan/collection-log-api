import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { PartialModelObject } from 'objection';

import { CollectionLogData } from '@datatypes/CollectionLogData';
import { repositories } from '@middleware/common';
import { RepositoryContext } from '@middleware/repository';
import { CollectionLog, CollectionLogUser } from '@models/index';
import { LambdaService } from '@services/lambda';
import { errorResponse, successResponse } from '@utils/handler-utils';

const updateCollectionLog: APIGatewayProxyHandlerV2 = async (event, context) => {
  const accountHash = event.pathParameters?.accountHash as string;
  const body = JSON.parse(event.body as string);

  let logData = body.collectionLog as CollectionLogData;
  if (!logData) {
    logData = body.data.collectionLog as CollectionLogData;
  }

  if (!accountHash) {
    return errorResponse(400, 'Invalid request');
  }

  const { repositories: { clRepo } } = context as RepositoryContext;

  let collectionLog = await clRepo.findByAccountHash(accountHash);

  if (!collectionLog) {
    const user = await CollectionLogUser.query().findOne({ account_hash: accountHash });
    if (!user) {
      return errorResponse(404, 'Unable to find existing user to update');
    }

    console.log(`STARTING COLLECTION LOG CREATE FOR ${user.username}`);
    collectionLog = await CollectionLog.query().insert({
      userId: user.id,
    });
    collectionLog.user = user;
  }

  const { username, isBanned } = collectionLog.user;

  if (isBanned) {
    return errorResponse(403, 'User not permitted to upload collection log data');
  }

  if (collectionLog.isUpdating) {
    return successResponse(200, 'Collection log update in progress');
  }

  console.log(`STARTING COLLECTION LOG UPDATE FOR ${username}`);

  const { uniqueObtained, uniqueItems } = logData;
  const logUpdateData: PartialModelObject<CollectionLog> = {
    uniqueObtained,
    uniqueItems,
  };
  await collectionLog.$query().update(logUpdateData);

  const lambdaService = LambdaService.getInstance();
  await lambdaService.invoke('update-collection-log-details', {
    accountHash,
    username,
    logData,
  });

  return successResponse(200, 'Collection log update in progress');
};

export const handler = repositories(updateCollectionLog);
