import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { v4 } from 'uuid';

import CollectionLog from '../models/CollectionLog';
import CollectionLogEntry from '../models/CollectionLogEntry';
import CollectionLogItem from '../models/CollectionLogItem';
import CollectionLogKillCount from '../models/CollectionLogKillCount';
import CollectionLogTab from '../models/CollectionLogTab';
import CollectionLogUser from '../models/CollectionLogUser';
import dbConnect from '../services/databaseService';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await dbConnect();

  const body = JSON.parse(event.body as string);

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

  const collectionLog = await CollectionLog.create({ userId: user.id });
  const collectionLogTabs = await CollectionLogTab.findAll();
  const collectionLogEntries = await CollectionLogEntry.findAll();

  const tabData = body.collection_log.tabs;
  const items: any = [];
  const killCounts: any = [];

  for (let tabName in tabData) {

    // Check to see if there's an existing record for this tab
    // Create one if not
    let tab = collectionLogTabs.find((tab) => {
      return tab.name == tabName;
    });

    if (!tab) {
      tab = await CollectionLogTab.create({ name: tabName });
    }

    for (const entryName in tabData[tabName]) {

      // Check to see if there's an existing record for this entry
      // Create one if not
      let entry = collectionLogEntries.find((entry) => {
        return entry.name == entryName;
      });

      if (!entry) {
        entry = await CollectionLogEntry.create({
          collectionLogTabId: tab?.id,
          name: entryName,
        });
      }

      const entryData = tabData[tabName][entryName];

      // Save item data for bulk insert
      entryData.items.forEach((item: any) => {
        items.push({
          collectionLogId: collectionLog.id,
          collectionLogEntryId: entry?.id,
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          obtained: item.obtained,
        });
      });

      if (!entryData.kill_count) {
        continue;
      }

      // Save kill count data for bulk insert
      entryData.kill_count.forEach((killCount: string) => {
        const killCountData = killCount.split(': ');
        const name = killCountData[0];
        const amount = killCountData[1];

        killCounts.push({
          collectionLogId: collectionLog.id,
          collectionLogEntryId: entry?.id,
          name: name,
          amount: amount,
        });
      });
    }
  }

  await CollectionLogItem.bulkCreate(items);
  await CollectionLogKillCount.bulkCreate(killCounts);

  const resData = await collectionLog.jsonData();

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(resData),
  };
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  dbConnect();

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
  dbConnect();
  
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
  dbConnect();

  const username = event.pathParameters?.username as string;
  const user = await CollectionLogUser.findOne({
    where: {
      username: username,
    },
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
  dbConnect();

  const runeliteId = event.pathParameters?.runelite_id as string;
  const body = JSON.parse(event.body as string);

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

  const logData = body.collection_log.tabs;
  const updatedItems: any = [];

  for (const tabName in logData) {
    for (const entryName in logData[tabName]) {
      const entry = await CollectionLogEntry.findOne({
        where: {
          name: entryName,
        },
        include: {
          model: CollectionLogItem,
          where: {
            collectionLogId: user.collectionLog.id,
          }
        }
      });

      const items: Array<any> = logData[tabName][entryName].items;
      for (const itemData of items) {
        const item = entry?.items?.find((item) => {
          return item.itemId == itemData.id;
        });

        const itemId = item?.id ?? v4();

        updatedItems.push({
          id: itemId,
          collectionLogId: user.collectionLog.id,
          collectionLogEntryId: entry?.id,
          itemId: itemData.id,
          name: itemData.name,
          quantity: itemData.quantity,
          obtained: itemData.obtained,
        });
      }
    }
  }

  await CollectionLogItem.bulkCreate(updatedItems, {
    updateOnDuplicate: [
      'quantity',
      'obtained',
    ],
  });

  const resData = await user.collectionLog.jsonData();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resData),
  };
};
