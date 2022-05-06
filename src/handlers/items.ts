import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Sequelize } from 'sequelize-typescript';

import db from '@services/DatabaseService';

import CollectionLog from '@models/CollectionLog';
import CollectionLogEntry from '@models/CollectionLogEntry';
import CollectionLogItem from '@models/CollectionLogItem';
import CollectionLogKillCount from '@models/CollectionLogKillCount';
import CollectionLogTab from '@models/CollectionLogTab';
import CollectionLogUser from '@models/CollectionLogUser';

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

export const getEntryItemsByUsername = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const username = event.pathParameters?.username as string;
  const user = await CollectionLogUser.findOne({
    where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), username.toLowerCase()),
    include: [CollectionLog],
  });

  if (!user?.collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log items not found for username: ${username}` }),
    };
  };

  const entryName = event.queryStringParameters?.entryName;
  const offset: number|undefined = parseInt(event.queryStringParameters?.offset as string) || undefined;
  const limit: number|undefined = parseInt(event.queryStringParameters?.limit as string) || undefined;

  const entry = await CollectionLogEntry.findOne({
    attributes: [
      'id',
      'name',
    ],
    include: [{
      model: CollectionLogKillCount,
      attributes: [
        'name',
        'amount',
      ],
      where: {
        collectionLogId: user.collectionLog.id,
      },
      required: false,
    }],
    where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('CollectionLogEntry.name')), entryName?.toLowerCase()),
  });

  if (!entry) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log entry not found with name: ${entryName}`}),
    };
  };

  const items = await CollectionLogItem.findAndCountAll({
    attributes: [
      ['item_id', 'id'],
      'name',
      'quantity',
      'obtained',
      'sequence',
    ],
    where: {
      collectionLogEntryId: entry.id,
      collectionLogId: user.collectionLog.id,
    },
    order: ['sequence'],
    limit: limit,
    offset: offset,
  })

  const resData = {
    username: user.username,
    entry: entry.name,
    item_count: items.count,
    items: items.rows,
    kill_count: entry.killCounts,
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resData),
  };
}