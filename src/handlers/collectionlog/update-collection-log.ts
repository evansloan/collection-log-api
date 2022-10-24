import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { PartialModelObject } from 'objection';

import CollectionLogDao from '@dao/CollectionLogDao';
import { CollectionLogData } from '@datatypes/CollectionLogData';
import { middleware } from '@middleware/common';
import { CollectionLog } from '@models/index';
import { LambdaService } from '@services/lambda';
import { errorResponse, successResponse } from '@utils/handler-utils';

const updateCollectionLog: APIGatewayProxyHandlerV2 = async (event) => {
  const accountHash = event.pathParameters?.accountHash as string;
  const body = JSON.parse(event.body as string);
  const logData: CollectionLogData = body.collection_log;

  if (!accountHash) {
    return errorResponse(400, 'Invalid request');
  }

  const existingLog = await CollectionLogDao.getByAccountHash(accountHash);

  if (!existingLog) {
    return errorResponse(404, 'Unable to find collection log to update');
  }

  const { username, isBanned } = existingLog.user;

  if (isBanned) {
    return errorResponse(403, 'User not permitted to upload collection log data');
  }

  if (existingLog.isUpdating) {
    return successResponse(200, 'Collection log update in progress');
  }

  console.log(`STARTING COLLECTION LOG UPDATE FOR ${username}`);

  const { unique_obtained: uniqueObtained, unique_items: uniqueItems } = logData;
  const logUpdateData: PartialModelObject<CollectionLog> = {
    uniqueObtained,
    uniqueItems,
  };
  await existingLog.$query().update(logUpdateData);

  const lambdaService = LambdaService.getInstance();
  await lambdaService.invoke('update-collection-log-details', {
    accountHash,
    username,
    logData,
  });

  return successResponse(200, 'Collection log update in progress');
};

export const handler = middleware(updateCollectionLog);
