import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import { CollectionLog, CollectionLogUser } from '@models/index';
import { response } from '@utils/handler-utils';

const getRankByUsername: APIGatewayProxyHandlerV2 = async (event, context) => {
  const { database: db } = context as DatabaseContext;
  const paramsUsername = event.pathParameters?.username as string;

  const userRanksQuery = db.select({ username: 'username' })
    .rank('rank', (qb) => {
      qb.orderBy('unique_obtained', 'DESC')
        .orderBy('collection_log.updated_at', 'ASC');
    })
    .from(CollectionLogUser.tableName)
    .join(CollectionLog.tableName, 'collection_log.user_id', '=', 'collection_log_user.id')
    .where({ is_banned: false })
    .andWhere('collection_log.deleted_at', null)
    .andWhere('collection_log_user.deleted_at', null);

  const rank = await db.with('user_ranks', userRanksQuery)
    .select({
      pos: 'user_ranks.rank',
      username: 'user_ranks.username',
    })
    .from('user_ranks')
    .whereRaw('LOWER(username) = ?', [paramsUsername.toLowerCase()])
    .first();

  return response(200, { rank: rank?.pos });
};

export const handler = middleware(getRankByUsername);
