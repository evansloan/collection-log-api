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
import db from '@services/database';

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


  if (!body.runelite_id && !body.account_hash) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Invalid post body' }),
    };
  }

  const runeliteId = body.runelite_id;
  const useAccountHash = !isNaN(Number(runeliteId));

  let user = await CollectionLogUser.findOne({
    where: useAccountHash ? { accountHash: runeliteId } : { runeliteId },
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

  console.log(`STARTING CREATE FOR USER: ${user.username}`);

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

  const itemsToCreate: any = [];
  const kcToCreate: any = [];

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
        itemsToCreate.push({
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
    
        kcToCreate.push({
          id: v4(),
          collectionLogId: collectionLog?.id,
          collectionLogEntryId: entry?.id,
          name: name,
          amount: amount,
        });
      });
    }
  }

  await CollectionLogItem.bulkCreate(itemsToCreate, {
    updateOnDuplicate: [
      'name',
      'quantity',
      'obtained',
      'sequence',
      'obtainedAt',
      'updatedAt',
    ],
  });

  await CollectionLogKillCount.bulkCreate(kcToCreate, {
    updateOnDuplicate: [
      'amount',
      'updatedAt',
    ]
  });

  await CollectionLog.update({
    isUpdating: false,
  }, {
    where: { id: collectionLog?.id },
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
  // TODO: replace runeliteId permenantly with accountHash
  const accountHash = Number(runeliteId);
  const body = JSON.parse(event.body as string);
  const logData: CollectionLogData = body.collection_log;

  if (!runeliteId && !accountHash) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: 'Invalid post body' }),
    };
  }

  let user = await CollectionLogUser.findOne({
    where: !isNaN(accountHash) ? { accountHash: runeliteId } : { runeliteId },
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

  console.log('STARTING UPDATE FOR:', user.username);

  const logUpdateData = {
    uniqueObtained: logData.unique_obtained,
    uniqueItems: logData.unique_items,
    totalObtained: logData.total_obtained,
    totalItems: logData.total_items,
    isUpdating: true,
  };
  await CollectionLog.update(logUpdateData, {
    where: { id: user.collectionLog?.id },
  });

  const collectionLogTabs = await CollectionLogTab.findAll();
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
    const tab = collectionLogTabs.find((tab) => tab.name == tabName);
    for (const entryName in logData.tabs[tabName]) {
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
    
      itemData.forEach((item, i) => {
        const existingItem = existingItems.find((ei) => {
          return ei.itemId == item.id && ei.collectionLogEntryId == entry?.id;
        });
    
        const isUpdated = itemsToUpdate.find((ui: any) => {
          return ui.itemId == item.id && ui.collectionLogEntryId == entry?.id;
        });
    
        if (isUpdated) {
          return;
        }

        const dbId = existingItem?.id ?? v4();
        const newObtained = !existingItem?.obtained && item.obtained;
        const newUnObtained = existingItem?.obtained && !item.obtained;
        const newQuantity = existingItem?.quantity != item.quantity;

        const shouldUpdate = newObtained || newUnObtained || newQuantity;

        let obtainedAt: Date|string|undefined = existingItem?.obtainedAt;
        if (newObtained) {
          obtainedAt = new Date().toISOString();
        }
        if (newUnObtained) {
          obtainedAt = undefined
        }

        if (shouldUpdate) {
          itemsToUpdate.push({
            id: dbId,
            collectionLogId: user?.collectionLog?.id,
            collectionLogEntryId: entry?.id,
            itemId: item.id,
            name: item.name,
            quantity: item.quantity,
            obtained: item.obtained,
            sequence: i,
            obtainedAt: obtainedAt,
          });
        }
      });

      const killCountData = logData.tabs[tabName][entryName].kill_count;
    
      killCountData?.forEach((killCount: string) => {
        const killCountSplit = killCount.split(': ');
        const name = killCountSplit[0];
        const amount = Number(killCountSplit[1]);
    
        const existingKc = existingKillCounts.find((ekc) => {
          return ekc.name == name && ekc.collectionLogEntryId == entry?.id;
        });
    
        const isUpdated = kcToUpdate.find((ukc: any) => {
          return ukc.name == name && ukc.collectionLogId == entry?.id;
        });
    
        if (isUpdated) {
          return;
        }
    
        const dbId = existingKc?.id ?? v4();
        const shouldUpdate = existingKc?.amount != amount;

        if (shouldUpdate) {
          kcToUpdate.push({
            id: dbId,
            collectionLogId: user?.collectionLog?.id,
            collectionLogEntryId: entry?.id,
            name: name,
            amount: amount,
          });
      }
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
  const accountHash = Number(runeliteId);
  const useAccountHash = !isNaN(accountHash);

  console.log(`Finding collection log using ${useAccountHash ? 'account_hash' : 'runelite_id'}: ${useAccountHash ? accountHash : runeliteId}`);

  const user = await CollectionLogUser.findOne({
    where: useAccountHash ? { accountHash: runeliteId } : { runeliteId },
    include: [CollectionLog],
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ exists: user?.collectionLog ? true : false }),
  }
}
