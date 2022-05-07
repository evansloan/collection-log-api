import { SQSEvent, APIGatewayProxyResult } from "aws-lambda";
import { Sequelize } from 'sequelize-typescript';
import { v4 } from 'uuid';

import {
  CollectionLog,
  CollectionLogEntry,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogTab,
  CollectionLogUser,
} from '@models/index';
import db from '@services/DatabaseService';
import { CollectionLogItemSQSMessageBody } from '@services/sqs/messages';

db.addModels([
  CollectionLog,
  CollectionLogEntry,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogTab,
  CollectionLogUser,
]);

const headers = {
  'content-type': 'application/json',
  'Access-Control-Allow-Origin': '*',
};

export const updateCollectionLog = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  const sqsRecord = event.Records[0];
  const sqsMessage = JSON.parse(sqsRecord.body as string);

  console.log(`Executing queued collection log ${sqsMessage.id} update.`, {
    messageId: sqsRecord.messageId,
  })

  await CollectionLog.update(sqsMessage.itemCounts, {
    where: { id: sqsMessage.id },
  });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ sqsMessage }),
  };
}

export const updateCollectionLogEntry = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  const sqsRecord = event.Records[0];
  const sqsMessage = JSON.parse(sqsRecord.body as string);

  console.log(`Executing queued collection log entry ${sqsMessage.name} update.`, {
    messageId: sqsRecord.messageId,
  });

  const itemsToUpdate: any = [];
  const kcToUpdate: any = [];

  const existingItems = await CollectionLogItem.findAll({
    where: {
      collectionLogId: sqsMessage.collectionLogId,
      collectionLogEntryId: sqsMessage.id,
    },
  });

  const existingKillCounts = await CollectionLogKillCount.findAll({
    where: {
      collectionLogId: sqsMessage.collectionLogId,
      collectionLogEntryId: sqsMessage.id,
    },
  });

  sqsMessage.items.forEach((item: CollectionLogItemSQSMessageBody, i: number) => {
    const existingItem = existingItems.find((ei) => {
      return ei.itemId == item.id;
    });

    const isUpdated = itemsToUpdate.find((ui: any) => {
      return ui.itemId == item.id;
    });

    if (isUpdated) {
      return;
    }

    const dbId = existingItem?.id ?? v4();
    const newObtained = !existingItem?.obtained && item.obtained;
    const obtainedAt = newObtained ? new Date().toISOString() : existingItem?.obtainedAt;

    itemsToUpdate.push({
      id: dbId,
      collectionLogId: sqsMessage.collectionLogId,
      collectionLogEntryId: sqsMessage.id,
      itemId: item.id,
      name: item.name,
      quantity: item.quantity,
      obtained: item.obtained,
      sequence: i,
      obtainedAt: obtainedAt,
    });
  });

  sqsMessage.killCounts?.forEach((killCount: string) => {
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
      collectionLogId: sqsMessage.collectionLogId,
      collectionLogEntryId: sqsMessage.id,
      name: name,
      amount: amount,
    });
  });

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

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ sqsMessage }),
  };
}
