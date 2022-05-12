import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Sequelize } from 'sequelize-typescript';
import { v4 } from 'uuid';

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
    userId: user.id,
    isUpdating: true,
  });
  const collectionLogTabs = await CollectionLogTab.findAll();
  const collectionLogEntries = await CollectionLogEntry.findAll();

  const itemsToUpdate: any = [];
  const kcToUpdate: any = [];

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

      const itemData = logData.tabs[tabName][entryName].items;
    
      itemData.forEach((item, i: number) => {
        const obtainedAt = item.obtained ? new Date().toISOString() : null;
        itemsToUpdate.push({
          id: v4(),
          collectionLogId: collectionLog?.id,
          collectionLogEntryId: entry?.id,
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          obtained: item.obtained,
          sequence: i,
          obtainedAt: obtainedAt,
        });
      });

      const killCountData = logData.tabs[tabName][entryName].kill_count;
    
      killCountData?.forEach((killCount: string) => {
        const killCountSplit = killCount.split(': ');
        const name = killCountSplit[0];
        const amount = killCountSplit[1];
    
        kcToUpdate.push({
          id: v4(),
          collectionLogId: collectionLog?.id,
          collectionLogEntryId: entry?.id,
          name: name,
          amount: amount,
        });
      });
    }
  }

  await CollectionLogItem.bulkCreate(itemsToUpdate, {
    updateOnDuplicate: [
      'name',
      'quantity',
      'obtained',
      'sequence',
      'obtainedAt',
      'updatedAt',
    ],
  });

  await CollectionLogKillCount.bulkCreate(kcToUpdate, {
    updateOnDuplicate: [
      'amount',
      'updatedAt',
    ]
  });

  await CollectionLog.update({
    isUpdating: false,
  }, {
    where: { id: user.collectionLog?.id },
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify({ message: 'Collection log created'}),
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

  if (user.collectionLog.isUpdating) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: `Collection log update currently in progress` }),
    };
  }

  const itemCounts = {
    uniqueObtained: logData.unique_obtained,
    uniqueItems: logData.unique_items,
    totalObtained: logData.total_obtained,
    totalItems: logData.total_items,
    isUpdating: true,
  };
  await CollectionLog.update(itemCounts, {
    where: { id: user.collectionLog?.id },
  });

  const collectionLogEntries = await CollectionLogEntry.findAll();

  const existingItems = await CollectionLogItem.findAll({
    where: {
      collectionLogId: user.collectionLog.id,
    },
  });
  const existingKillCounts = await CollectionLogKillCount.findAll({
    where: {
      collectionLogId: user.collectionLog.id,
    },
  });

  const itemsToUpdate: any = [];
  const kcToUpdate: any = [];

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

      const itemData = logData.tabs[tabName][entryName].items;
    
      itemData.forEach((item, i: number) => {
        const existingItem = existingItems.find((ei) => {
          return ei.itemId == item.id && ei.collectionLogEntryId == entry.id;
        });
    
        const isUpdated = itemsToUpdate.find((ui: any) => {
          return ui.itemId == item.id && ui.collectionLogEntryId == entry.id;
        });
    
        if (isUpdated) {
          return;
        }
    
        const dbId = existingItem?.id ?? v4();
        const newObtained = !existingItem?.obtained && item.obtained;
        const obtainedAt = newObtained ? new Date().toISOString() : existingItem?.obtainedAt;
    
        itemsToUpdate.push({
          id: dbId,
          collectionLogId: user.collectionLog?.id,
          collectionLogEntryId: entry.id,
          itemId: item.id,
          name: item.name,
          quantity: item.quantity,
          obtained: item.obtained,
          sequence: i,
          obtainedAt: obtainedAt,
        });
      });

      const killCountData = logData.tabs[tabName][entryName].kill_count;
    
      killCountData?.forEach((killCount: string) => {
        const killCountSplit = killCount.split(': ');
        const name = killCountSplit[0];
        const amount = killCountSplit[1];
    
        const existingKc = existingKillCounts.find((ekc) => {
          return ekc.name == name;
        });
    
        const isUpdated = kcToUpdate.find((ukc: any) => {
          return ukc.name == name;
        });
    
        if (isUpdated) {
          return;
        }
    
        const dbId = existingKc?.id ?? v4();
    
        kcToUpdate.push({
          id: dbId,
          collectionLogId: user.collectionLog?.id,
          collectionLogEntryId: entry.id,
          name: name,
          amount: amount,
        });
      });
    }
  }
    
  await CollectionLogItem.bulkCreate(itemsToUpdate, {
    updateOnDuplicate: [
      'name',
      'quantity',
      'obtained',
      'sequence',
      'obtainedAt',
      'updatedAt',
    ],
  });

  await CollectionLogKillCount.bulkCreate(kcToUpdate, {
    updateOnDuplicate: [
      'amount',
      'updatedAt',
    ]
  });

  await CollectionLog.update({
    isUpdating: false,
  }, {
    where: { id: user.collectionLog?.id },
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ message: 'Collection log updated' }),
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
