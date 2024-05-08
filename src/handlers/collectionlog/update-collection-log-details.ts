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
 * Old page names that should be ignored.
 * These pages can still exist in data provided
 * via plugin, ignore them if we come across them.
 */
const INVALID_PAGES: string[] = [
  'Callisto',
  'Venenatis',
  'Vet\'ion',
];

/**
 * Item ID map to find existing items with a different ID that are
 * the same item.
 */
const ITEM_ID_MAPPINGS: { [key: number]: number } = {
  29472: 12013, // Prospector hat
  29474: 12014, // Prospector top
  29476: 12015, // Propector legs
  29478: 12016, // Prospector boots
};

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

  const clDao = new CollectionLogDao();

  const existingLog = await clDao.getByAccountHash(accountHash);
  if (!existingLog) {
    return errorResponse(404, 'Unable to find collection log to update');
  }

  await existingLog.$query().update({ isUpdating: true });

  const collectionLogTabs = await CollectionLogTab.query();
  const collectionLogPages = await CollectionLogPage.query();
  const existingItems = await clDao.getItemsWithRelated(false);
  const existingKcs = await clDao.getKillCountsWithRelated();
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
        if (INVALID_PAGES.includes(pageName)) {
          continue;
        }

        page = await CollectionLogPage.query().insert({
          collectionLogTabId: tab.id,
          name: pageName,
        });
      }

      const pageData = logData.tabs[tabName][pageName];
      const itemData = pageData.items;
      const killCountData = pageData.killCounts;

      itemData.forEach((item, i) => {
        const { id: itemId, name, quantity, obtained } = item;

        const isUpdated = itemsToUpdate.find((updatedItem) => {
          return updatedItem.itemId == itemId && updatedItem.collectionLogEntryId == page?.id;
        });

        if (isUpdated) {
          return;
        }

        /*
         * Check if an exact match (item id and page id) for this item exists.
         * Use it's db pk if so
         */
        let existingItem = existingItems?.find((existingItem) => {
          return existingItem.itemId == itemId && existingItem.collectionLogEntryId == page?.id;
        });

        let dbId = v4();
        if (existingItem) {
          dbId = existingItem.id;
        }

        /*
         * Exact match for this item doesn't exist. See if it exists in another page and copy it's details.
         * Can happen when an existing item is added to a new page.
         */
        if (!existingItem) {
          existingItem = existingItems?.find((existingItem) => {
            return existingItem.itemId == itemId;
          });
        }

        /**
         * Check if item was assigned a new item id by checking ITEM_ID_MAPPINGS
         * Only current scenario this applies to is prospectors outfit in motherlode mine and volacanic mine
         */
        if (!existingItem) {
          const newId = ITEM_ID_MAPPINGS[itemId];
          if (newId) {
            existingItem = existingItems?.find((existingItem) => (
              existingItem.itemId == newId
            ));
          }
        }

        const newItem = existingItem?.id != dbId;
        const newObtained = !existingItem?.obtained && obtained;
        const newQuantity = existingItem?.quantity != quantity;
        const newName = existingItem?.name != name;
        const newSequence = existingItem?.sequence != i;

        const shouldUpdate = newItem
          || newObtained
          || newQuantity
          || newName
          || newSequence;

        let obtainedAt = existingItem?.obtainedAt;
        if (newObtained && !obtainedAt) {
          obtainedAt = new Date();
          existingLog.user.recentObtainedDate = obtainedAt;
          existingLog.user.obtainedCollectionLogItemId = dbId;
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

      killCountData?.forEach((killCount, i) => {
        const { amount, name } = killCount;

        const isUpdated = kcsToUpdate.find((updatedKillCount) => {
          return updatedKillCount.name == name && updatedKillCount.collectionLogEntryId == page?.id;
        });

        if (isUpdated) {
          return;
        }

        const existingKillCount = existingKcs?.find((existingKillCount) => {
          return existingKillCount.name == name && existingKillCount.collectionLogEntryId == page?.id;
        });

        const dbId = existingKillCount?.id ?? v4();
        const newAmount = existingKillCount?.amount != amount;
        const newSequence = existingKillCount?.sequence != i;

        const shouldUpdate = newAmount || newSequence;

        if (shouldUpdate) {
          kcsToUpdate.push({
            id: dbId,
            collectionLogId: existingLog.id,
            collectionLogEntryId: page?.id,
            name,
            amount,
            sequence: i,
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
        'sequence',
        'updated_at',
      ]);
  }

  await existingLog.$query().update({ isUpdating: false });
  await existingLog.user.$query().update({ ...existingLog.user });

  return successResponse(200, `Collection log detail update for ${username} successful`);
};

export const handler = middleware(updateCollectionLogDetails);
