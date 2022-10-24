import { Handler } from 'aws-lambda';
import { PartialModelObject } from 'objection';
import { v4 } from 'uuid';

import CollectionLogDao from '@dao/CollectionLogDao';
import { CollectionLogData } from '@datatypes/CollectionLogData';
import { middleware } from '@middleware/common';
import {
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogPage,
  CollectionLogTab,
} from '@models/index';
import { errorResponse, successResponse } from '@utils/handler-utils';

interface ItemUpdateEvent {
  accountHash: string;
  username: string;
  logData: CollectionLogData;
}

/**
 * Lambda function to handle updating items and kill counts.
 *
 * Logic exists in it's own lambda due to hard 30 second timeout
 * limit when invoking functions from API gateway.
 *
 * @param event Lambda invoke payload
 */
const updateCollectionLogDetails: Handler = async (event: ItemUpdateEvent) => {
  const {
    accountHash,
    username,
    logData,
  } = event;

  console.log(`STARTING COLLECTION LOG DETAIL UPDATE FOR ${username}`);

  const existingLog = await CollectionLogDao.getByAccountHash(accountHash);
  if (!existingLog) {
    return errorResponse(404, 'Unable to find collection log to update');
  }

  await existingLog.$query().update({ isUpdating: true });

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

  if (itemsToUpdate.length > 0) {
    console.log(`STARTING COLLECTION LOG DETAIL ITEM UPDATE FOR ${username}`);
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
  }

  if (kcsToUpdate.length > 0) {
    console.log(`STARTING COLLECTION LOG DETAIL KILL COUNT UPDATE FOR ${username}`);
    await CollectionLogKillCount.query()
      .insert(kcsToUpdate)
      .onConflict('id')
      .merge([
        'amount',
        'updated_at',
      ]);
  }

  await existingLog.$query().update({ isUpdating: false });

  return successResponse(200, `Collection log detail update for ${username} successful`);
};

export const handler = middleware(updateCollectionLogDetails);
