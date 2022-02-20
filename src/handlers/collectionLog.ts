import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import CollectionLogTable from '../tables/CollectionLogTable';
import UserTable from '../tables/UserTable';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body as string);

  const clTable = new CollectionLogTable();
  const userTable = new UserTable();

  const user = await userTable.getByRuneliteId(body.runelite_id);
  const existingLog = await clTable.getByUser(user);

  if (existingLog) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existingLog),
    }
  }

  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `User not found with runelite_id: ${body.runelite_id}` }),
    }
  }

  delete body.runelite_id;
  body.user_id = user.user_id;

  const collectionLog = await clTable.create(body);

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(collectionLog),
  };
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id as string;
  const collectionLog = await new CollectionLogTable().get(id);

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

export const collectionLogExists = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const runeliteId = event.pathParameters?.runelite_id as string;

  const userTable = new UserTable();
  const clTable = new CollectionLogTable();

  const user = await userTable.getByRuneliteId(runeliteId);
  const collectionLog = await clTable.getByUser(user);

  if (!collectionLog) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ exists: false }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ exists: true }),
  };
}
