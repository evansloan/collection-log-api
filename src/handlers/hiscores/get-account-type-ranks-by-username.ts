import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import { CollectionLog, CollectionLogUser } from '@models/index';
import { response } from '@utils/handler-utils';
import {
  AccountType,
  GROUP_IRONMAN_TYPES,
  IRONMAN_TYPES,
} from '@datatypes/CollectionLogUserData';

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

  const accountTypeRanksQuery = db.select({ username: 'username', account_type: 'account_type' })
    .rank('rank', (qb) => {
      qb.orderBy('rank', 'ASC');
    })
    .from('all_ranks');

  const ironmanRanksQuery = accountTypeRanksQuery.clone()
    .whereIn('account_type', IRONMAN_TYPES);
  const hcIronmanRanksQuery = accountTypeRanksQuery.clone()
    .where({ account_type: AccountType.HARDCORE_IRONMAN });
  const ultIronmanRanksQuery = accountTypeRanksQuery.clone()
    .where({ account_type: AccountType.ULTIMATE_IRONMAN });
  const gimRanksQuery = accountTypeRanksQuery.clone()
    .whereIn('account_type', GROUP_IRONMAN_TYPES);
  const hcGimRanksQuery = accountTypeRanksQuery.clone()
    .where({ account_type: AccountType.HARDCORE_GROUP_IRONMAN });
  const normalRanksQuery = accountTypeRanksQuery.clone()
    .where({ account_type: AccountType.NORMAL });

  const ranks = await db.with('all_ranks', allRanksQuery)
    .with('ironman_ranks', ironmanRanksQuery)
    .with('hc_ironman_ranks', hcIronmanRanksQuery)
    .with('ult_ironman_ranks', ultIronmanRanksQuery)
    .with('gim_ranks', gimRanksQuery)
    .with('hc_gim_ranks', hcGimRanksQuery)
    .with('normal_ranks', normalRanksQuery)
    .select({
      ALL: 'all_ranks.rank',
      [AccountType.IRONMAN]: 'ironman_ranks.rank',
      [AccountType.HARDCORE_IRONMAN]: 'hc_ironman_ranks.rank',
      [AccountType.ULTIMATE_IRONMAN]: 'ult_ironman_ranks.rank',
      [AccountType.GROUP_IRONMAN]: 'gim_ranks.rank',
      [AccountType.HARDCORE_GROUP_IRONMAN]: 'hc_gim_ranks.rank',
      [AccountType.NORMAL]: 'normal_ranks.rank',
    })
    .from('all_ranks')
    .leftJoin('ironman_ranks', 'ironman_ranks.username', 'all_ranks.username')
    .leftJoin('hc_ironman_ranks', 'hc_ironman_ranks.username', 'all_ranks.username')
    .leftJoin('ult_ironman_ranks', 'ult_ironman_ranks.username', 'all_ranks.username')
    .leftJoin('gim_ranks', 'gim_ranks.username', 'all_ranks.username')
    .leftJoin('hc_gim_ranks', 'hc_gim_ranks.username', 'all_ranks.username')
    .leftJoin('normal_ranks', 'normal_ranks.username', 'all_ranks.username')
    .whereRaw('LOWER(all_ranks.username) = ?', [paramsUsername.toLowerCase()])
    .first();

  return response(200, { accountTypeRanks: { ...ranks } });
};

export const handler = middleware(getAccountTypeRanksByUsername);
