import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { raw } from 'objection';

import { middleware } from '@middleware/common';
import { CollectionLogUser } from '@models/index';
import { errorResponse, response } from '@utils/handler-utils';

const getUserSettings: APIGatewayProxyHandlerV2 = async (event) => {
  const paramsUsername = event.pathParameters?.username as string;

  const user = await CollectionLogUser.query()
    .findOne(raw('LOWER(??)', 'username'), '=', paramsUsername.toLowerCase())
    .orderBy('updated_at', 'DESC');

  if (!user) {
    return errorResponse(404, `Unable to find user with username: ${paramsUsername}`);
  }

  return response(200, {
    userSettings: {
      showQuantity: user.showQuantity,
      displayRank: user.displayRank,
    },
  });
};

export const handler = middleware(getUserSettings);
