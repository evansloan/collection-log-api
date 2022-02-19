import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
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
      entryData.items.forEach((item: any, i: number) => {
        items.push({
          collectionLogId: collectionLog.id,
          collectionLogEntryId: entry?.id,
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          obtained: item.obtained,
          sequence: i,
          obtainedAt: item.obtained ? Date.now() : null,
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
  const updatedKillCounts: any = [];

  for (const tabName in logData) {
    for (const entryName in logData[tabName]) {
      const entry = await CollectionLogEntry.findOne({
        where: {
          name: entryName,
        },
        include: [{
          model: CollectionLogItem,
          where: {
            collectionLogId: user.collectionLog.id,
          }
        }, {
          model: CollectionLogKillCount,
          where: {
            collectionLogId: user.collectionLog.id,
          },
          required: false,
        }],
      });

      const items: any = logData[tabName][entryName].items;
      items.forEach(async(itemData: any, i: number) => {
        let duplicates = entry?.items?.filter((item) => {
          return item.itemId == itemData.id;
        });

        // remove any duplicate item records that may have been
        // uploaded due to plugin bug
        const item = duplicates ? duplicates[0] : undefined;
        if (duplicates && duplicates.length > 1) {
          duplicates[1].destroy();
        }

        const existingItem = updatedItems.find((updatedItem: any) => {
          return updatedItem.itemId == item?.itemId && updatedItem.collectionLogEntryId == entry?.id;
        });

        if (existingItem) {
          return;
        }

        const itemId = item?.id ?? v4();
        const newItem = !item?.obtained && itemData.obtained;

        updatedItems.push({
          id: itemId,
          collectionLogId: user.collectionLog?.id,
          collectionLogEntryId: entry?.id,
          itemId: itemData.id,
          name: itemData.name,
          quantity: itemData.quantity,
          obtained: itemData.obtained,
          sequence: i,
          obtainedAt: newItem ? Date.now() : item?.obtainedAt,
        });
      });

      const killCounts = logData[tabName][entryName].kill_count;
      killCounts?.forEach((killCountData: string) => {
        const killCountSplit = killCountData.split(': ');
        const name = killCountSplit[0];
        const amount = killCountSplit[1];

        const existingKc = entry?.killCounts?.find((killCount) => {
          return killCount.name == name;
        });

        const killCountId = existingKc?.id ?? v4();

        updatedKillCounts.push({
          id: killCountId,
          collectionLogId: user.collectionLog?.id,
          collectionLogEntryId: entry?.id,
          name: name,
          amount: amount,
        });
      });
    }
  }

  await CollectionLogItem.bulkCreate(updatedItems, {
    updateOnDuplicate: [
      'quantity',
      'obtained',
      'sequence',
    ],
  });

  await CollectionLogKillCount.bulkCreate(updatedKillCounts, {
    updateOnDuplicate: [
      'amount'
    ]
  });

  const resData = await user.collectionLog.jsonData();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(resData),
  };
};

export const collectionLogExists = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  dbConnect();
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

export const recentItems = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  dbConnect();
  const username = event.pathParameters?.username as string;

  const user = await CollectionLogUser.findOne({
    where: {
      username: username,
    },
    include: [{
      model: CollectionLog,
      include: [{
        model: CollectionLogItem,
        where: {
          obtainedAt: { [Op.ne]: null },
        },
        limit: 5,
        subQuery: false,
      }],
      order: [['items', 'obtained_at', 'DESC']],
    }],
  });

  if (!user?.collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with username: ${username}` }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(user.collectionLog.items),
  }
}