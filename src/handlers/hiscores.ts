import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Op } from 'sequelize';
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
import { Col, Fn } from 'sequelize/types/utils';

type HiscoresType = 'total' | 'unique';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

const validAccountTypes = [
  'NORMAL',
  'IRONMAN',
  'GROUP_IRONMAN',
  'HARDCORE_IRONMAN',
  'ULTIMATE_IRONMAN',
];

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
  if (accountType && validAccountTypes.indexOf(accountType) != -1) {
    accountTypeFilter = {
      accountType: accountType,
    };
  }

  const limit = 25;
  const offset = limit * (page - 1);

  const obtainedDate = new Date();
  obtainedDate.setDate(obtainedDate.getDate() - 7);

  let recentObtained: Col | Fn = Sequelize.col('collectionLog->items.item_id');
  if (hiscoresType == 'unique') {
    recentObtained = Sequelize.fn('DISTINCT', recentObtained);
  }

  const hiscores = await CollectionLogUser.findAll({
    attributes: {
      include: [
        [Sequelize.fn('MAX', Sequelize.col(`collectionLog.${hiscoresType}_obtained`)), 'obtained'],
        [Sequelize.fn('MAX', Sequelize.col(`collectionLog.${hiscoresType}_items`)), 'total'],
        [Sequelize.fn('COUNT', recentObtained), 'recent_obtained'],
      ],
      exclude: [
        'id',
        'runeliteId',
        'accountHash',
        'isFemale',
        'isBanned',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    },
    include: [{
      model: CollectionLog,
      attributes: [],
      required: true,
      include: [{
        model: CollectionLogItem,
        attributes: [],
        where: {
          obtained: true,
          obtainedAt: {
            [Op.gte]: obtainedDate,
          },
        },
        duplicating: false,
        required: false,
      }],
    }],
    where: {
      ...accountTypeFilter,
      runeliteId: {
        [Op.ne]: null,
      },
      isBanned: false,
    },
    order: [[Sequelize.fn('MAX', `collectionLog.${hiscoresType}_obtained`), 'DESC']],
    limit: 25,
    offset: offset,
    group: ['CollectionLogUser.id'],
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(hiscores),
  };
};