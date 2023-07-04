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
    console.log(`EXISTING USER FOR ${username} FOUND. STARTING USER UPDATE`);
    await existingUser.$query().update({
      username,
      accountType,
      isFemale,
      displayRank,
      showQuantity,
    });

    return response(200, existingUser);
  }

  const userExistsWithName = await CollectionLogUser.query().findOne({ username }) != undefined;
  if (userExistsWithName) {
    console.log(`EXISTING USER FOR ${username} FOUND. ACCOUNT HASH MISMATCH`);
    return errorResponse(401, `Invalid account hash for user ${username}`);
  }

  console.log(`EXISTING USER FOR ${username} NOT FOUND. STARTING USER CREATE`);

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
