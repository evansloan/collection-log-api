import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import UserTable from '../tables/UserTable';


const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const create = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const body = JSON.parse(event.body as string);

  const userTable = new UserTable();
  const existingUser = await userTable.getByRuneliteId(body.runelite_id);

  if (existingUser) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existingUser),
    }
  }

  body.username = body.username.toLowerCase();
  const user = await new UserTable().create(body);
  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(user),
  };
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id as string;
  const user = await new UserTable().get(id);

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

  const user = await new UserTable().update(id, body);

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
