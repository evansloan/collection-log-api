import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import CollectionLog from '../models/CollectionLog';
import CollectionLogEntry from '../models/CollectionLogEntry';
import CollectionLogItem from '../models/CollectionLogItem';
import CollectionLogKillCount from '../models/CollectionLogKillCount';
import CollectionLogTab from '../models/CollectionLogTab';
import User from '../models/User';
import dbConnect from '../services/databaseService';
import CollectionLogTable from '../tables/CollectionLogTable';
import UserTable from '../tables/UserTable';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await dbConnect();

  const body = JSON.parse(event.body as string);

  const user = await User.findOne({ where: {
    runeliteId: body.runelite_id,
  }});

  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `User not found with runelite_id: ${body.runelite_id}` }),
    }
  }

  const existingLog = user.collectionLog;

  if (existingLog) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existingLog),
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

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(collectionLog),
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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(collectionLog),
  };
};

export const getByRuneliteId = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const runeliteId = event.pathParameters?.runelite_id as string;

  const userTable = new UserTable();
  const clTable = new CollectionLogTable();

  const user = await userTable.getByRuneliteId(runeliteId);
  const collectionLog = await clTable.getByUser(user);

  if (!collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with runelite_id: ${runeliteId}` }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(collectionLog),
  };
}

export const getByUsername = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const username = event.pathParameters?.username as string;

  const userTable = new UserTable();
  const clTable = new CollectionLogTable();

  const user = await userTable.getByUsername(username);
  const collectionLog = await clTable.getByUser(user);

  if (!collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with username: ${username}` }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(collectionLog),
  };
}

export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const runeliteId = event.pathParameters?.runelite_id as string;
  const body = JSON.parse(event.body as string);

  const userTable = new UserTable();
  const clTable = new CollectionLogTable();

  const user = await userTable.getByRuneliteId(runeliteId);

  const existingLog = await clTable.getByUser(user);
  if (!existingLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `Collection log not found with runelite_id: ${runeliteId}` }),
    };
  }

  body.user_id = user?.user_id
  const collectionLogId = existingLog.collectionlog_id as string;
  const collectionLog = await new CollectionLogTable().update(collectionLogId, body);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(collectionLog),
  };
};
