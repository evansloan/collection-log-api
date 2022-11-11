import { middleware } from '@middleware/common';
import CollectionLogGroup from '@models/CollectionLogGroup';
import { response } from '@utils/handler-utils';
import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { raw } from 'objection';

const getGroupByName: APIGatewayProxyHandlerV2 = async (event) => {
  const name = event.pathParameters?.name as string;

  const { ref } = CollectionLogGroup;
  const group = await CollectionLogGroup.query()
    .findOne(raw('LOWER(??)', ref('name')), '=', name.toLowerCase())
    .modify('defaultSelects')
    .modify('withUsers');

  return response(200, { group });
};

export const handler = middleware(getGroupByName);
