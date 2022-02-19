import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import CollectionLogUser from '../models/CollectionLogUser';
import dbConnect from '../services/databaseService';

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await dbConnect();
  const body = JSON.parse(event.body as string);

  const existingUser = await CollectionLogUser.findOne({ where: { 
    runeliteId: body.runelite_id 
  }});

  if (existingUser) {
    await existingUser.update({
      username: body.username,
    });
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existingUser),
    }
  }

  const user = await CollectionLogUser.create({
    username: body.username,
    runeliteId: body.runelite_id,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(user),
  };
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  await dbConnect();
  const id = event.pathParameters?.id as string;
  const user = await CollectionLogUser.findByPk(id);

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
  await dbConnect();
  const id = event.pathParameters?.id as string;
  const body = JSON.parse(event.body as string);

  const user = await CollectionLogUser.update({ username: body.username }, {
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
