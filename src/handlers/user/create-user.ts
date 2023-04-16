import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { CollectionLogUser } from '@models/index';
import { errorResponse, response } from '@utils/handler-utils';

const create: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body as string);

  if (!body.accountHash) {
    return errorResponse(400, 'Invalid post body');
  }

  console.log(`STARTING USER CREATE FOR ${body.username}`);

  const {
    username,
    accountType,
    accountHash,
    isFemale,
    userSettings,
  } = body;

  let displayRank = 'ALL';
  let showQuantity = true;
  if (userSettings) {
    displayRank = userSettings.displayRank;
    showQuantity = userSettings.showQuantity;
  }

  const existingUser = await CollectionLogUser.query().findOne({ account_hash: accountHash });
  if (existingUser) {
    await existingUser.$query().update({
      username,
      accountType,
      isFemale,
      displayRank,
      showQuantity,
    });

    return response(200, existingUser);
  }

  console.log(`EXISTING USER FOR ${body.username} NOT FOUND. STARTING USER CREATE`);

  const user = await CollectionLogUser.query().insert({
    username,
    accountType,
    accountHash,
    isFemale,
    displayRank,
    showQuantity,
  });

  return response(201, user);
};

export const handler = middleware(create);
