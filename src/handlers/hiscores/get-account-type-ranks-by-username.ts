import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import { CollectionLog, CollectionLogUser } from '@models/index';
import { response } from '@utils/handler-utils';
import { AccountType, GROUP_IRONMAN_TYPES, IRONMAN_TYPES } from '@datatypes/CollectionLogUserData';

const getAccountTypeRanksByUsername: APIGatewayProxyHandlerV2 = async (event, context) => {
  const { database: db } = context as DatabaseContext;
  const paramsUsername = event.pathParameters?.username as string;

  const allRanksQuery = db.select({ username: 'username', account_type: 'account_type' })
    .rank('rank', (qb) => {
      qb.orderBy('unique_obtained', 'DESC')
        .orderBy('collection_log.updated_at', 'ASC');
    })
    .from(CollectionLogUser.tableName)
    .join(CollectionLog.tableName, 'collection_log.user_id', '=', 'collection_log_user.id')
    .where({ is_banned: false })
    .andWhere('collection_log.deleted_at', null)
    .andWhere('collection_log_user.deleted_at', null);

  const accountTypeRanksQuery = db.select({ username: 'username', accountType: 'account_type' })
    .rank('rank', (qb) => {
      qb.orderBy('rank', 'ASC');
    })
    .from('all_ranks');

  const ironmanRanksQuery = accountTypeRanksQuery.clone()
    .whereIn('account_type', IRONMAN_TYPES);
  const gimRanksQuery = accountTypeRanksQuery.clone()
    .whereIn('account_type', GROUP_IRONMAN_TYPES);
  const normalRanksQuery = accountTypeRanksQuery.clone()
    .where({ account_type: AccountType.NORMAL });

  const ranks = await db.with('all_ranks', allRanksQuery)
    .with('ironman_ranks', ironmanRanksQuery)
    .with('gim_ranks', gimRanksQuery)
    .with('normal_ranks', normalRanksQuery)
    .select({
      username: 'all_ranks.username',
      rank: 'all_ranks.rank',
      ironmanRank: 'ironman_ranks.rank',
      groupIronmanRank: 'gim_ranks.rank',
      normalRank: 'normal_ranks.rank',
    })
    .from('all_ranks')
    .leftJoin('ironman_ranks', 'ironman_ranks.username', 'all_ranks.username')
    .leftJoin('gim_ranks', 'gim_ranks.username', 'all_ranks.username')
    .leftJoin('normal_ranks', 'normal_ranks.username', 'all_ranks.username')
    .whereRaw('LOWER(all_ranks.username) = ?', [paramsUsername.toLowerCase()])
    .first();

  return response(200, { ranks });
};

export const handler = middleware(getAccountTypeRanksByUsername);
