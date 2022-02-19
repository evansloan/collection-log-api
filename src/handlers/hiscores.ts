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

  // Can't find a good way to do this in the ORM
  const resData = await db.query(`
    SELECT clu.username as username,
           MAX(uniqueObtained.obtainedItems) AS obtained,
           COUNT(DISTINCT cli.item_id) AS total
    FROM collection_log cl
      JOIN collection_log_user clu ON clu.id = cl.user_id
      JOIN collection_log_item cli ON cli.collection_log_id = cl.id
      JOIN (
        SELECT COUNT(DISTINCT item_id) as obtainedItems,
               collection_log_id 
        FROM collection_log_item 
        WHERE obtained 
        GROUP BY collection_log_id
      ) uniqueObtained on uniqueObtained.collection_log_id = cl.id
    GROUP BY clu.id, cl.id
    ORDER BY obtained DESC
    LIMIT ${limit} OFFSET ${offset};
  `, {
    raw: false,
    type: QueryTypes.SELECT
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
        [Sequelize.fn('SUM', Sequelize.literal('CASE WHEN items.obtained THEN 1 ELSE 0 END')), 'obtained'],
        [Sequelize.fn('COUNT', Sequelize.col('items.id')), 'total'],
        [Sequelize.col('user.username'), 'username']
      ]
    }, 
    include: [{
      model: CollectionLogUser,
      attributes: [],
    }, {
      model: CollectionLogItem,
      attributes: [],
    }],
    group: ['CollectionLog.id', 'user.id'],
    order: [[Sequelize.col('obtained'), 'DESC']],
    limit: 25,
    offset: offset,
    subQuery: false,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(resData),
  };
}
