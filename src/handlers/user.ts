import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import User from '../models/User';
import db from '../services/DatabaseService';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body as string);

  try {
    await db.authenticate();
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify(`Unabled to establish database connection: ${error}`),
    }
  }

  const existingUser = await User.findOne({
    where: { 
      runeliteId: body.runelite_id 
    }
  });

  if (existingUser) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existingUser),
    }
  }

  const user = await User.create({
    username: body.username.toLowerCase(),
    runeliteId: body.runelite_id,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(user),
  };
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id as string;
  const user = await User.findByPk(id);

  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ error: `User not found with ID: ${id}` }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(user),
  };
};

export const update = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id as string;
  const body = JSON.parse(event.body as string);

  const user = await User.update({ username: body.username }, {
    where: { id: id }
  });

  if (!user) {
    return {
      statusCode: 404,
      headers,
      body: JSON.stringify({ updated: false }),
    };
  }

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ updated: true }),
  };
};
