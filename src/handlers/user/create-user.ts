import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { CollectionLogUser } from '@models/index';
import { headers, response } from '@utils/handler-utils';

const create: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body as string);

  if (!body.account_hash) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid post body' }),
    };
  }

  console.log(`STARTING USER CREATE FOR ${body.username}`);

  const { username, account_type: accountType, account_hash: accountHash, is_female: isFemale } = body;
  const existingUser = await CollectionLogUser.query().findOne({ account_hash: accountHash });

  if (existingUser) {
    await existingUser.$query().update({
      username,
      accountType,
      isFemale,
    });

    return response(200, existingUser);
  }

  console.log(`EXISTING USER FOR ${body.username} NOT FOUND. STARTING USER CREATE`);

  const user = await CollectionLogUser.query().insert({
    username,
    accountType,
    accountHash,
    isFemale,
  });

  return response(201, user);
};

export const handler = middleware(create);
