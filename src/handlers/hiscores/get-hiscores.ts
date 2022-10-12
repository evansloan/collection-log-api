import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { AccountType } from '@datatypes/CollectionLogUserData';
import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import { CollectionLog, CollectionLogUser } from '@models/index';
import { headers } from '@utils/handler-utils';

const getHiscores: APIGatewayProxyHandlerV2 = async (event, context) => {
  const { database: db } = context as DatabaseContext;
  const accountType = event.queryStringParameters?.accountType?.toUpperCase();
  let page = parseInt(event.pathParameters?.page as string);

  if (!page) {
    page = 1;
  }

  const limit = 25;
  const offset = limit * (page - 1);

  const selects = {
    username: 'username',
    accountType: 'account_type',
    obtained: 'unique_obtained',
    total: 'unique_items',
  };

  let hiscoresQuery = db.select(selects)
    .rank('rank', (qb) => {
      qb.orderBy('unique_obtained', 'DESC')
        .orderBy('collection_log.updated_at', 'ASC');
    })
    .from(CollectionLogUser.tableName)
    .join(CollectionLog.tableName, 'collection_log.user_id', '=', 'collection_log_user.id')
    .where({ is_banned: false })
    .andWhere('collection_log.deleted_at', null) // Using the base knex querybuilder, have to specify null delete records
    .andWhere('collection_log_user.deleted_at', null)
    .orderBy('unique_obtained', 'DESC')
    .limit(limit)
    .offset(offset);

  if (accountType && accountType in AccountType) {
    if (accountType == AccountType.IRONMAN) {
      hiscoresQuery = hiscoresQuery.andWhere((qb) => {
        qb.where({ account_type: AccountType.IRONMAN })
          .orWhere({ account_type: AccountType.HARDCORE_IRONMAN })
          .orWhere({ account_type: AccountType.ULTIMATE_IRONMAN });
      });
    } else if (accountType == AccountType.GROUP_IRONMAN) {
      hiscoresQuery = hiscoresQuery.andWhere((qb) => {
        qb.where({ account_type: AccountType.GROUP_IRONMAN })
          .orWhere({ account_type: AccountType.HARDCORE_GROUP_IRONMAN });
      });
    } else {
      hiscoresQuery.andWhere({ account_type: accountType });
    }
  }

  const hiscores = await hiscoresQuery;

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ hiscores }),
  };
};

export const getHiscoresHandler = middleware(getHiscores);
