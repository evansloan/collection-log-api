import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

import { CollectionLogUserData } from '@datatypes/CollectionLogUserData';
import {
  CollectionLog,
  CollectionLogEntry,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogTab,
  CollectionLogUser,
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

  if (!body.account_hash && !body.runelite_id) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid post body' }),
    };
  }

  let existingUser = null;

  // TODO: replace runeliteId permenantly with accountHash
  if (body.account_hash) {
    existingUser = await CollectionLogUser.findOne({
      where: {
        accountHash: body.account_hash,
      },
    });
  }

  if (!existingUser && body.runelite_id) {
    existingUser = await CollectionLogUser.findOne({
      where: {
        runeliteId: body.runelite_id,
      },
    });
  }

  if (existingUser) {
    let updateData: CollectionLogUserData = {
      username: body.username,
      accountType: body.account_type,
      isFemale: body.is_female,
    };

    if (!existingUser.accountHash && body.account_hash) {
      updateData.accountHash = body.account_hash;
    }

    await existingUser.update(updateData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existingUser),
    }
  }

  const user = await CollectionLogUser.create({
    username: body.username,
    accountType: body.account_type,
    runeliteId: body.runelite_id,
    accountHash: body.account_hash,
    isFemale: body.is_female,
  });

  return {
    statusCode: 201,
    headers,
    body: JSON.stringify(user),
  };
};

export const get = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
