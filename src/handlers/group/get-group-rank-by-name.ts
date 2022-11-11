import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { DatabaseContext } from '@middleware/database';
import { middleware } from '@middleware/common';
import { response } from '@utils/handler-utils';
import CollectionLogGroup from '@models/CollectionLogGroup';

const getGroupRankByName: APIGatewayProxyHandlerV2 = async (event, context) => {
  const { database: db } = context as DatabaseContext;
  const paramsName = event.pathParameters?.name as string;

  const groupRanksQuery = db.select({ name: 'name' })
    .rank('rank', (qb) => {
      qb.orderBy('unique_obtained', 'DESC')
        .orderBy('collection_log_group.updated_at', 'ASC');
    })
    .from(CollectionLogGroup.tableName)
    .andWhere('collection_log_group.deleted_at', null);

  const rank = await db.with('group_ranks', groupRanksQuery)
    .select({
      pos: 'group_ranks.rank',
      name: 'group_ranks.name',
    })
    .from('group_ranks')
    .whereRaw('LOWER(name) = ?', [paramsName.toLowerCase()])
    .first();

  return response(200, { rank: rank?.pos });
};

export const handler = middleware(getGroupRankByName);
