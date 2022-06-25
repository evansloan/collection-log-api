import { APIGatewayProxyEvent, APIGatewayProxyHandlerV2, APIGatewayProxyResult } from 'aws-lambda';
import { Op, QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import {
  CollectionLog,
  CollectionLogEntry,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogTab,
  CollectionLogUser,
} from '@models/index';
import db from '@services/database';
import { AccountType } from '@datatypes/CollectionLogUserData';

type HiscoresType = 'total' | 'unique';

interface RankData {
  username: string;
  pos: number;
}

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

db.addModels([
  CollectionLog,
  CollectionLogEntry,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogTab,
  CollectionLogUser,
]);

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const hiscoresType = event.pathParameters?.type as HiscoresType;
  const accountType = event.queryStringParameters?.accountType?.toUpperCase();

  let page = 1;
  if (event.pathParameters?.page) {
    page = parseInt(event.pathParameters?.page);
  }

  let accountTypeFilter = undefined;
  if (accountType && accountType in AccountType) {
    accountTypeFilter = {
      accountType: accountType,
    };

    if (accountType == AccountType.IRONMAN) {
      accountTypeFilter = {
        [Op.or]: [
          { accountType: AccountType.IRONMAN },
          { accountType: AccountType.HARDCORE_IRONMAN },
          { accountType: AccountType.ULTIMATE_IRONMAN },
        ],
      };
    }

    if (accountType == AccountType.GROUP_IRONMAN) {
      accountTypeFilter = {
        [Op.or]: [
          { accountType: AccountType.GROUP_IRONMAN },
          { accountType: AccountType.HARDCORE_GROUP_IRONMAN },
        ],
      };
    }
  }

  const limit = 25;
  const offset = limit * (page - 1);

  const obtainedCol = Sequelize.col(`"collectionLog"."${hiscoresType}_obtained"`);
  const totalCol = Sequelize.col(`"collectionLog"."${hiscoresType}_items"`);

  const rank = `RANK() OVER (ORDER BY ${obtainedCol.col} DESC, "collectionLog"."updated_at" ASC)`;

  const hiscores = await CollectionLogUser.scope('info').findAll({
    attributes: [
      [Sequelize.literal(rank), 'rank'],
      [obtainedCol, 'obtained'],
      [totalCol, 'total'],
    ],
    include: [{
      model: CollectionLog,
      attributes: [],
      required: true,
    }],
    where: {
      ...accountTypeFilter,
      isBanned: false,
    },
    order: [[obtainedCol, 'DESC']],
    limit: 25,
    offset: offset,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(hiscores),
  };
};

export const getRankByUsername: APIGatewayProxyHandlerV2 = async (event) => {
  const username = event.pathParameters?.username as string;

  // Not a fan of using raw SQL here but using the query builder seems like it would be a pain
  const getRank = async (type: string, username: string) => {
    const subQuery = `
      SELECT
        RANK() OVER (ORDER BY "cl"."${type}_obtained" DESC, "cl"."updated_at" ASC) AS "pos",
        "clu"."username" AS "username"
      FROM
        "collection_log_user" "clu"
        JOIN "collection_log" "cl" ON "cl"."user_id" = "clu"."id"
      WHERE
        "clu"."is_banned" = 'f' AND
        "clu"."deleted_at" IS NULL AND
        "cl"."deleted_at" IS NULL
    `;

    const query = `
      SELECT
        "psq"."pos",
        "psq"."username"
      FROM (${subQuery}) "psq"
      WHERE
        LOWER("psq"."username") = ?
      LIMIT 1
    `;

    const results = await db.query(query, {
      replacements: [username.toLowerCase()],
      type: QueryTypes.SELECT,
    });

    return results[0] as RankData;
  };

  const totalRank = await getRank('total', username);
  const uniqueRank = await getRank('unique', username);

  const resData = {
    username: username,
    ranks: {
      total: totalRank.pos,
      unique: uniqueRank.pos,
    },
  };

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resData),
  };
};
