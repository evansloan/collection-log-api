import { middleware } from '@middleware/common';
import CollectionLogUser from '@models/CollectionlogUser';
import { errorResponse, response } from '@utils/handler-utils';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { raw } from 'objection';

const getUserByUsername: APIGatewayProxyHandlerV2 = async (event) => {
  const username = event.pathParameters?.username;

  if (!username) {
    return errorResponse(400, 'Invalid request');
  }

  const user = await CollectionLogUser.query()
    .where(raw('LOWER(??)', 'username'), '=', username.toLowerCase());

  if (!user) {
    return errorResponse(404, `Could not find user with username ${username}`);
  }

  return response(200, { user });
};

export const handler = middleware(getUserByUsername);
