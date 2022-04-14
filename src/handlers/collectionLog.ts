import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
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

  const collectionLog = await CollectionLog.create({
    uniqueObtained: body.collection_log.unique_obtained,
    uniqueItems: body.collection_log.unique_items,
    totalObtained: body.collection_log.total_obtained,
    totalItems: body.collection_log.total_items,
    userId: user.id 
  });
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
          obtainedAt: item.obtained ? new Date().toISOString() : null,
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

  await user.collectionLog.update({
    uniqueObtained: body.collection_log.unique_obtained,
    uniqueItems: body.collection_log.unique_items,
    totalObtained: body.collection_log.total_obtained,
    totalItems: body.collection_log.total_items,
  });

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
          },
          required: false,
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

        const isUpdated = updatedItems.find((updatedItem: any) => {
          return updatedItem.itemId == item?.itemId && updatedItem.collectionLogEntryId == entry?.id;
        });

        if (isUpdated) {
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
          obtainedAt: newItem ? new Date().toISOString() : item?.obtainedAt,
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

        const isUpdated = updatedKillCounts.find((updatedKc: any) => {
          return updatedKc.id == existingKc?.id;
        });

        if (isUpdated) {
          return;
        }

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
      'name',
      'quantity',
      'obtained',
      'sequence',
      'obtainedAt',
      'updatedAt',
    ],
  });

  await CollectionLogKillCount.bulkCreate(updatedKillCounts, {
    updateOnDuplicate: [
      'amount',
      'updatedAt',
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
    include: [CollectionLog],
    where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('username')), username.toLowerCase()),
  });

  if (!user?.collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with username: ${username}` }),
    };
  }

  const items = await CollectionLogItem.findAll({
    attributes: [
      [Sequelize.col('item_id'), 'itemId'],
      [Sequelize.col('name'), 'name'],
      [Sequelize.fn('MAX', Sequelize.col('quantity')), 'quantity'],
      [Sequelize.col('obtained'), 'obtained'],
      [Sequelize.fn('MAX', Sequelize.col('obtained_at')), 'obtainedAt'],
    ],
    where: {
      collectionLogId: user.collectionLog.id,
      obtained: true,
    },
    group: ['item_id', 'name', 'obtained'],
    order: [
      [Sequelize.fn('MAX', Sequelize.col('obtained_at')), 'DESC'],
      [Sequelize.fn('MAX', Sequelize.col('sequence')), 'DESC'],
    ],
    limit: 5,
  });

  const response = {
    username: user.username,
    account_type: user.accountType,
    items: items,
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(response),
  }
}
