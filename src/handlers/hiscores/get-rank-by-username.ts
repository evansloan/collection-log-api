import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import { CollectionLog, CollectionLogUser } from '@models/index';
import { response } from '@utils/handler-utils';
import { AccountType } from '@datatypes/CollectionLogUserData';

const getRankByUsername: APIGatewayProxyHandlerV2 = async (event, context) => {
  const { database: db } = context as DatabaseContext;
  const paramsUsername = event.pathParameters?.username as string;
  const accountType = event.queryStringParameters?.accountType?.toUpperCase();

  let userRanksQuery = db.select({ username: 'username' })
    .rank('rank', (qb) => {
      qb.orderBy('unique_obtained', 'DESC')
        .orderBy('collection_log.updated_at', 'ASC');
    })
    .from(CollectionLogUser.tableName)
    .join(CollectionLog.tableName, 'collection_log.user_id', '=', 'collection_log_user.id')
    .where({ is_banned: false })
    .andWhere('collection_log.deleted_at', null)
    .andWhere('collection_log_user.deleted_at', null);

  if (accountType && accountType in AccountType) {
    if (accountType == AccountType.IRONMAN) {
      userRanksQuery = userRanksQuery.andWhere((qb) => {
        qb.where({ account_type: AccountType.IRONMAN })
          .orWhere({ account_type: AccountType.HARDCORE_IRONMAN })
          .orWhere({ account_type: AccountType.ULTIMATE_IRONMAN });
      });
    } else if (accountType == AccountType.GROUP_IRONMAN) {
      userRanksQuery = userRanksQuery.andWhere((qb) => {
        qb.where({ account_type: AccountType.GROUP_IRONMAN })
          .orWhere({ account_type: AccountType.HARDCORE_GROUP_IRONMAN });
      });
    } else {
      userRanksQuery.andWhere({ account_type: accountType });
    }
  }

  const rank = await db.with('user_ranks', userRanksQuery)
    .select({
      pos: 'user_ranks.rank',
      username: 'user_ranks.username',
    })
    .from('user_ranks')
    .whereRaw('LOWER(username) = ?', [paramsUsername.toLowerCase()])
    .first();

  if (!rank && accountType) {
    return response(200, { rank: 0 });
  }

  return response(200, { rank: rank?.pos });
};

export const handler = middleware(getRankByUsername);
