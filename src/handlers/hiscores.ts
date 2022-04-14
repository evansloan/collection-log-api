import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import CollectionLog from '../models/CollectionLog';
import CollectionLogUser from '../models/CollectionLogUser';
import dbConnect from '../services/databaseService';

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

export const unique = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await dbConnect();

  let accountType = event.queryStringParameters?.accountType?.toUpperCase();

  let accountTypeFilter = undefined;
  if (accountType && validAccountTypes.indexOf(accountType) != -1) {
    accountTypeFilter = {
      accountType: accountType,
    }
  }

  let page = 1;
  if (event.pathParameters?.page) {
    page = parseInt(event.pathParameters?.page);
  }

  const limit = 25;
  const offset = limit * (page - 1);

  const resData = await CollectionLogUser.findAll({
    attributes: {
      include: [
        [Sequelize.col('collectionLog.unique_obtained'), 'obtained'],
        [Sequelize.col('collectionLog.unique_items'), 'total'],
      ],
      exclude: [
        'id',
        'runeliteId',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    },
    include: [{
      model: CollectionLog,
      attributes: [],
      required: true,
    }],
    where: {
      ...accountTypeFilter,
      runeliteId: {
        [Op.ne]: null,
      },
    },
    order: [[Sequelize.literal('"collectionLog"."unique_obtained"'), 'DESC']],
    limit: 25,
    offset: offset,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(resData),
  };
}

export const total = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await dbConnect();

  let accountType = event.queryStringParameters?.accountType?.toUpperCase();

  let accountTypeFilter = undefined;
  if (accountType && validAccountTypes.indexOf(accountType) != -1) {
    accountTypeFilter = {
      accountType: accountType,
    }
  }

  let page = 1;
  if (event.pathParameters?.page) {
    page = parseInt(event.pathParameters?.page);
  }

  const limit = 25;
  const offset = limit * (page - 1);

  const resData = await CollectionLogUser.findAll({
    attributes: {
      include: [
        [Sequelize.col('collectionLog.total_obtained'), 'obtained'],
        [Sequelize.col('collectionLog.total_items'), 'total'],
      ],
      exclude: [
        'id',
        'runeliteId',
        'createdAt',
        'updatedAt',
        'deletedAt',
      ],
    },
    include: [{
      model: CollectionLog,
      attributes: [],
      required: true,
    }],
    where: {
      ...accountTypeFilter,
      runeliteId: {
        [Op.ne]: null,
      },
    },
    order: [[Sequelize.literal('"collectionLog"."total_obtained"'), 'DESC']],
    limit: 25,
    offset: offset,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(resData),
  };
}
