import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { PartialModelObject } from 'objection';
import { v4 } from 'uuid';

import { CollectionLogData } from '@datatypes/CollectionLogData';
import { middleware } from '@middleware/common';
import {
  CollectionLog,
  CollectionLogItem,
  CollectionLogKillCount,
  CollectionLogPage,
  CollectionLogTab,
  CollectionLogUser,
} from '@models/index';
import { errorResponse, response } from '@utils/handler-utils';
import CollectionLogDao from '@dao/CollectionLogDao';

const create: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body as string);

  if (!body.account_hash) {
    return errorResponse(400, 'Invalid post body');
  }

  const user = await CollectionLogUser.query()
    .findOne('account_hash', body.account_hash)
    .withGraphJoined('collectionLog');

  if (!user) {
    return errorResponse(404, 'User not found');
  }

  const { username, isBanned, collectionLog } = user;

  if (isBanned) {
    return errorResponse(403, 'User not permitted to upload collection log data');
  }

  if (collectionLog) {
    const formattedLog = await CollectionLogDao.getFormattedCollectionLog(collectionLog, user);
    return response(200, formattedLog);
  }

  console.log(`STARTING COLLECTION LOG CREATE FOR USER ${user.username}`);

  const logData: CollectionLogData = body.collection_log;
  const {
    unique_obtained: uniqueObtained,
    unique_items: uniqueItems,
    total_obtained: totalObtained,
    total_items: totalItems,
  } = logData;

  const newCollectionLog = await CollectionLog.query().insert({
    uniqueObtained,
    uniqueItems,
    totalObtained,
    totalItems,
    isUpdating: true,
    userId: user.id,
  });

  const collectionLogTabs = await CollectionLogTab.query();
  const collectionLogPages = await CollectionLogPage.query();

  const itemsToCreate: PartialModelObject<CollectionLogItem>[] = [];
  const kcToCreate: PartialModelObject<CollectionLogKillCount>[] = [];

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

      const itemData = logData.tabs[tabName][pageName].items;
      itemData.forEach((item, i) => {
        const { id: itemId, name, quantity, obtained } = item;
        const obtainedAt = obtained ? new Date() : undefined;
        itemsToCreate.push({
          id: v4(),
          collectionLogId: newCollectionLog.id,
          collectionLogEntryId: page?.id,
          itemId,
          name,
          quantity,
          obtained,
          sequence: i,
          obtainedAt,
        });
      });

      const killCountData = logData.tabs[tabName][pageName].kill_count;

      killCountData?.forEach((killCount: string) => {
        const killCountSplit = killCount.split(': ');
        const name = killCountSplit[0];
        const amount = Number(killCountSplit[1]);

        kcToCreate.push({
          id: v4(),
          collectionLogId: newCollectionLog.id,
          collectionLogEntryId: page?.id,
          name,
          amount,
        });
      });
    }
  }

  await CollectionLogItem.query().insert(itemsToCreate);
  await CollectionLogKillCount.query().insert(kcToCreate);

  await newCollectionLog.$query().update({ isUpdating: false });

  const res = {
    username,
    collectionLogId: newCollectionLog.id,
    message: 'Collection log created',
  };
  return response(201, res);
};

export const handler = middleware(create);
