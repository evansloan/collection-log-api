import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { PartialModelObject } from 'objection';

import CollectionLogDao from '@dao/CollectionLogDao';
import { CollectionLogData } from '@datatypes/CollectionLogData';
import { middleware } from '@middleware/common';
import { CollectionLog, CollectionLogItem, CollectionLogKillCount, CollectionLogPage, CollectionLogTab } from '@models/index';
import { errorResponse, successResponse } from '@utils/handler-utils';
import { v4 } from 'uuid';

const updateCollectionLog: APIGatewayProxyHandlerV2 = async (event) => {
  const accountHash = event.pathParameters?.runelite_id as string;
  const body = JSON.parse(event.body as string);
  const logData: CollectionLogData = body.collection_log;

  if (!accountHash) {
    return errorResponse(400, 'Invalid request');
  }

  const existingLog = await CollectionLogDao.getByAccountHash(accountHash);

  if (!existingLog) {
    return errorResponse(404, 'Unable to find collection log to update');
  }

  const { username, isBanned } = existingLog.user;

  if (isBanned) {
    return errorResponse(403, 'User not permitted to upload collection log data');
  }

  if (existingLog.isUpdating) {
    return successResponse(200, 'Collection log update in progress');
  }

  console.log(`STARTING COLLECTION LOG UPDATE FOR ${username}`);

  const { unique_obtained: uniqueObtained, unique_items: uniqueItems } = logData;

  const logUpdateData: PartialModelObject<CollectionLog> = {
    uniqueObtained,
    uniqueItems,
    isUpdating: true,
  };

  await existingLog.$query().update(logUpdateData);

  const collectionLogTabs = await CollectionLogTab.query();
  const collectionLogPages = await CollectionLogPage.query();
  const existingItems = await CollectionLogDao.getItems(existingLog);
  const existingKcs = await CollectionLogDao.getKillCounts(existingLog);

  const itemsToUpdate: PartialModelObject<CollectionLogItem>[] = [];
  const kcsToUpdate: PartialModelObject<CollectionLogKillCount>[] = [];

  for (const tabName in logData.tabs) {
    /**
     * Check to see if there's an existing record for this tab.
     * Create one if not
     */
    let tab = collectionLogTabs.find((tab) => tab.name == tabName);
    if (!tab) {
      tab = await CollectionLogTab.query().insert({ name: tabName });
    }

    for (const pageName in logData.tabs[tabName]) {
      /**
       * Check to see if there's an existing record for this page.
       * Create one if not
       */
      let page = collectionLogPages.find((page) => page.name == pageName);
      if (!page) {
        page = await CollectionLogPage.query().insert({
          collectionLogTabId: tab.id,
          name: pageName,
        });
      }

      const pageData = logData.tabs[tabName][pageName];
      const itemData = pageData.items;
      const killCountData = pageData.kill_count;
      itemData.forEach((item, i) => {
        const { id: itemId, name, quantity, obtained } = item;

        const isUpdated = itemsToUpdate.find((updatedItem) => {
          return updatedItem.itemId == itemId && updatedItem.collectionLogEntryId == page?.id;
        });

        if (isUpdated) {
          return;
        }

        const existingItem = existingItems.find((existingItem) => {
          return existingItem.itemId == itemId && existingItem.collectionLogEntryId == page?.id;
        });

        const dbId = existingItem?.id ?? v4();
        const newObtained = !existingItem?.obtained && obtained;
        const newUnObtained = existingItem?.obtained && !obtained;
        const newQuantity = existingItem?.quantity != quantity;
        const newName = existingItem?.name != name;
        const newSequence = existingItem?.sequence != i;

        const shouldUpdate = newObtained
          || newUnObtained
          || newQuantity
          || newName
          || newSequence;

        let obtainedAt = existingItem?.obtainedAt;
        if (newObtained) {
          obtainedAt = new Date();
        }
        if (newUnObtained) {
          obtainedAt = undefined;
        }

        if (shouldUpdate) {
          itemsToUpdate.push({
            id: dbId,
            collectionLogId: existingLog.id,
            collectionLogEntryId: page?.id,
            itemId,
            name,
            quantity,
            sequence: i,
            obtained,
            obtainedAt,
          });
        }
      });

      killCountData?.forEach((killCount) => {
        const killCountSplit = killCount.split(': ');
        const name = killCountSplit[0];
        const amount = Number(killCountSplit[1]);

        const isUpdated = kcsToUpdate.find((updatedKillCount) => {
          return updatedKillCount.name == name && updatedKillCount.collectionLogEntryId == page?.id;
        });

        if (isUpdated) {
          return;
        }

        const existingKillCount = existingKcs.find((existingKillCount) => {
          return existingKillCount.name == name && existingKillCount.collectionLogEntryId == page?.id;
        });

        const dbId = existingKillCount?.id ?? v4();
        const shouldUpdate = existingKillCount?.amount != amount;

        if (shouldUpdate) {
          kcsToUpdate.push({
            id: dbId,
            collectionLogId: existingLog.id,
            collectionLogEntryId: page?.id,
            name,
            amount,
          });
        }
      });
    }
  }

  await CollectionLogItem.query()
    .insert(itemsToUpdate)
    .onConflict('id')
    .merge([
      'name',
      'quantity',
      'obtained',
      'sequence',
      'obtained_at',
      'updated_at',
    ]);

  await CollectionLogKillCount.query()
    .insert(kcsToUpdate)
    .onConflict('id')
    .merge([
      'amount',
      'updated_at',
    ]);

  await existingLog.$query().update({ isUpdating: false });

  return successResponse(200, 'Collection log updated');
};

export const updateCollectionLogHandler = middleware(updateCollectionLog);
