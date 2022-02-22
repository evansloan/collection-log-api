import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { QueryTypes } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';

import CollectionLog from '../models/CollectionLog';
import CollectionLogItem from '../models/CollectionLogItem';
import CollectionLogUser from '../models/CollectionLogUser';
import dbConnect from '../services/databaseService';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const unique = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const db = await dbConnect();

  let page = 1;
  if (event.pathParameters?.page) {
    page = parseInt(event.pathParameters?.page);
  }

  const limit = 25;
  const offset = limit * (page - 1);

  const resData = await CollectionLog.findAll({
    attributes: {
      include: [
        [Sequelize.col('unique_obtained'), 'obtained'],
        [Sequelize.col('unique_items'), 'total'],
        [Sequelize.col('user.username'), 'username'],
        [Sequelize.col('user.account_type'), 'account_type'],
      ]
    },
    include: [{
      model: CollectionLogUser,
      attributes: [],
    }],
    order: [['unique_obtained', 'DESC']],
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

  let page = 1;
  if (event.pathParameters?.page) {
    page = parseInt(event.pathParameters?.page);
  }

  const limit = 25;
  const offset = limit * (page - 1);

  const resData = await CollectionLog.findAll({
    attributes: {
      include: [
        [Sequelize.col('total_obtained'), 'obtained'],
        [Sequelize.col('total_items'), 'total'],
        [Sequelize.col('user.username'), 'username'],
        [Sequelize.col('user.account_type'), 'account_type'],
      ]
    },
    include: [{
      model: CollectionLogUser,
      attributes: [],
    }],
    order: [['total_obtained', 'DESC']],
    limit: 25,
    offset: offset,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(resData),
  };
}
