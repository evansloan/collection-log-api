import { APIGatewayProxyEvent, APIGatewayProxyHandlerV2, APIGatewayProxyResult } from 'aws-lambda';

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
    console.log(`MISSING IDENTIFIER FOR ${body.username}. RLID: ${body.runelite_id} AH: ${body.account_hash}`);
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ error: 'Invalid post body' }),
    };
  }

  console.log(`STARTING USER CREATE FOR ${body.username}`);

  let existingUser = null;

  // TODO: replace runeliteId permenantly with accountHash
  if (body.account_hash) {
    const accountHash = (body.account_hash as bigint).toString();
    existingUser = await CollectionLogUser.findOne({
      where: {
        accountHash,
      },
    });
  }

  if (!existingUser && body.runelite_id) {
    console.log(`EXISTING USER FOR ${body.username} NOT FOUND WITH account_hash. TRYING runelite_id`);
    existingUser = await CollectionLogUser.findOne({
      where: {
        runeliteId: body.runelite_id,
      },
    });
  }

  if (existingUser) {
    console.log(`EXISTING USER FOR ${body.username} FOUND. STARTING USER UPDATE`);

    const updateData: CollectionLogUserData = {
      username: body.username,
      accountType: body.account_type,
      isFemale: body.is_female,
    };

    if (!existingUser.accountHash && body.account_hash) {
      updateData.accountHash = (body.account_hash as bigint).toString();
    }

    await existingUser.update(updateData);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(existingUser),
    };
  }

  console.log(`EXISTING USER FOR ${body.username} NOT FOUND. STARTING USER CREATE`);

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
    where: { id },
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

export const count: APIGatewayProxyHandlerV2 = async () => {
  const userCount = await CollectionLogUser.count();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ count: userCount }),
  };
};
