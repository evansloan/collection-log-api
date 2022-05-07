import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Sequelize } from 'sequelize-typescript';

import { CollectionLogData } from '@datatypes/CollectionLogData';
import {
  CollectionLog,
  CollectionLogEntry,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogTab,
  CollectionLogUser
} from '@models/index';
import db from '@services/DatabaseService';
import SQSService from '@services/sqs/SQSService';
import { CollectionLogSQS, CollectionLogEntrySQS } from '@services/sqs/messages';

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

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body as string);

  if (!body.runelite_id) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Invalid path parameters' }),
    };
  }

  const user = await CollectionLogUser.findOne({
    where: {
      runeliteId: body.runelite_id,
    },
    include: [CollectionLog],
  });

  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `User not found with runelite_id: ${body.runelite_id}` }),
    }
  }

  const existingLog = user.collectionLog;

  if (existingLog) {
    const resData = await existingLog.jsonData();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(resData),
    }
  }

  console.log(`Starting create for user: ${user.username}`);

  const logData: CollectionLogData = body.collection_log;

  const collectionLog = await CollectionLog.create({
    uniqueObtained: logData.unique_obtained,
    uniqueItems: logData.unique_items,
    totalObtained: logData.total_obtained,
    totalItems: logData.total_items,
    userId: user.id 
  });
  const collectionLogTabs = await CollectionLogTab.findAll();
  const collectionLogEntries = await CollectionLogEntry.findAll();

  const sqs = new SQSService({ region: process.env.AWS_REGION });

  for (let tabName in logData.tabs) {

    // Check to see if there's an existing record for this tab
    // Create one if not
    let tab = collectionLogTabs.find((tab: CollectionLogTab) => {
      return tab.name == tabName;
    });

    if (!tab) {
      tab = await CollectionLogTab.create({ name: tabName });
    }


    for (const entryName in logData.tabs[tabName]) {

      // Check to see if there's an existing record for this entry
      // Create one if not
      let entry = collectionLogEntries.find((entry: CollectionLogEntry) => {
        return entry.name == entryName;
      });

      if (!entry) {
        entry = await CollectionLogEntry.create({
          collectionLogTabId: tab!.id,
          name: entryName,
        });
      }

      const entrySQSMessageBody = {
        id: entry.id,
        name: entry.name,
        collectionLogId: collectionLog!.id,
        items: logData.tabs[tabName][entryName].items,
        killCounts: logData.tabs[tabName][entryName].kill_count,
      }
      const entrySQSMessage = new CollectionLogEntrySQS(entrySQSMessageBody);
      const entrySQSResponse = sqs.queueUpdate(entrySQSMessage);
      console.log(entrySQSResponse);
    }
  }

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({}),
  };
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id as string;
  const collectionLog = await CollectionLog.findByPk(id);

  if (!collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with ID: ${id}` }),
    };
  }

  const resData = await collectionLog.jsonData();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resData),
  };
};

export const getByRuneliteId = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const runeliteId = event.pathParameters?.runelite_id as string;
  const user = await CollectionLogUser.findOne({
    where: {
      runeliteId: runeliteId,
    },
    include: [CollectionLog],
  });

  if (!user?.collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with runelite_id: ${runeliteId}` }),
    };
  }

  const resData = await user.collectionLog.jsonData();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resData),
  };
}

export const getByUsername = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const username = event.pathParameters?.username as string;
  const user = await CollectionLogUser.findOne({
    where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), username.toLowerCase()),
    include: [CollectionLog],
  });

  if (!user?.collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with username: ${username}` }),
    };
  }

  const resData = await user.collectionLog.jsonData();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resData),
  };
}

export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const runeliteId = event.pathParameters?.runelite_id as string;
  const body = JSON.parse(event.body as string);
  const logData: CollectionLogData = body.collection_log;

  if (!runeliteId) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Invalid path parameters' }),
    };
  }

  const user = await CollectionLogUser.findOne({
    where: {
      runeliteId: runeliteId
    },
    include: [CollectionLog]
  });

  if (!user?.collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with runelite_id: ${runeliteId}` }),
    };
  }

  console.log(`Starting update for user: ${user.username}`);

  const sqs = new SQSService({ region: process.env.AWS_REGION });

  const logSQSBody = {
    id: user.collectionLog.id,
    itemCounts: {
      uniqueObtained: logData.unique_obtained,
      uniqueItems: logData.unique_items,
      totalObtained: logData.total_obtained,
      totalItems: logData.total_items,
    },
  };
  const logSQSMessage = new CollectionLogSQS(logSQSBody);
  const logSQSResponse = sqs.queueUpdate(logSQSMessage);
  console.log(logSQSResponse);

  const collectionLogEntries = await CollectionLogEntry.findAll();

  for (const tabName in logData.tabs) {
    for (const entryName in logData.tabs[tabName]) {
      const entry = collectionLogEntries.find((entry: CollectionLogEntry) => {
        return entry.name == entryName;
      });

      if (!entry) {
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ error: `Unable to find existing collection log entry with name ${entryName}` }),
        };
      }

      console.log(`${user.username} - ${entry.name}`);

      const entrySQSMessageBody = {
        id: entry.id,
        name: entry.name,
        collectionLogId: user.collectionLog.id,
        items: logData.tabs[tabName][entryName].items,
        killCounts: logData.tabs[tabName][entryName].kill_count,
      }
      const entrySQSMessage = new CollectionLogEntrySQS(entrySQSMessageBody);
      const entrySQSResponse = sqs.queueUpdate(entrySQSMessage);
      console.log(entrySQSResponse);
    }
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({}),
  };
};

export const collectionLogExists = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const runeliteId = event.pathParameters?.runeliteId as string;

  const user = await CollectionLogUser.findOne({
    where: {
      runeliteId: runeliteId,
    },
    include: [CollectionLog],
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ exists: user?.collectionLog ? true : false }),
  }
}
