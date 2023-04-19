import { Knex } from 'knex';
import { v4 } from 'uuid';

import { readFileSync } from 'fs';

const TEMPLATE = JSON.parse(readFileSync('./seeds/data/template.json').toString());

const randInt = (max: number) => {
  return Math.floor(Math.random() * max);
};

const randBool = () => {
  return Boolean(Math.round(Math.random()));
};

const getAccountType = () => {
  const accountTypes = [
    'NORMAL',
    'IRONMAN',
    'HARDCORE_IRONMAN',
    'ULTIMATE_IRONMAN',
    'GROUP_IRONMAN',
    'HARDCORE_GROUP_IRONMAN',
  ];
  const index = randInt(accountTypes.length);
  return accountTypes[index];
};

export const seed = async (knex: Knex): Promise<void> => {
  const tabSet: { [key: string]: string } = {};
  const pageSet: { [key: string]: string } = {};
  const itemSet: number[] = [];

  const users = [];
  const tabs: any[] = [];
  const pages: any[] = [];
  const collectionLogs: any = [];
  const items: any = [];
  const killCounts: any = [];
  const date = new Date().toISOString();

  for (let i = 0; i < 10; i++) {
    const user = {
      id: v4(),
      username: `TestUser${i + 1}`,
      is_female: randBool(),
      account_hash: Math.round((i + 1) * (Math.random() * 10)),
      account_type: getAccountType(),
      created_at: date,
      updated_at: date,
    };
    users.push(user);
  }

  users.forEach((user) => {
    const collectionLogId = v4();
    const collectionLogTemplate = JSON.parse(JSON.stringify(TEMPLATE));
    const obtainedItems: number[] = [];

    Object.keys(collectionLogTemplate).forEach((tabName) => {
      let tabId = v4();
      if (tabSet[tabName] === undefined) {
        tabSet[tabName] = tabId;
        tabs.push({
          id: tabId,
          name: tabName,
          created_at: date,
          updated_at: date,
        });
      } else {
        tabId = tabSet[tabName];
      }
      const logPages = collectionLogTemplate[tabName];
      Object.keys(logPages).forEach((pageName) => {
        let pageId = v4();
        if (pageSet[pageName] === undefined) {
          pageSet[pageName] = pageId;
          pages.push({
            id: pageId,
            name: pageName,
            collection_log_tab_id: tabId,
            created_at: date,
            updated_at: date,
          });
        } else {
          pageId = pageSet[pageName];
        }
        const logItems = logPages[pageName].items;
        const logKillCounts = logPages[pageName].killCount;

        logItems.forEach((item: any) => {
          if (!itemSet.includes(item.id)) {
            itemSet.push(item.id);
          }
          const obtained = randBool();
          const quantity = obtained ? randInt(10) : 0;
          const obtainedAt = obtained ? date : null;

          if (obtained) {
            obtainedItems.push(item.id);
          }

          items.push({
            ...item,
            id: v4(),
            collection_log_id: collectionLogId,
            collection_log_entry_id: pageId,
            item_id: item.id,
            quantity,
            obtained,
            obtained_at: obtainedAt,
            created_at: date,
            updated_at: date,
          });
        });

        logKillCounts?.forEach((killCount: any) => {
          killCounts.push({
            id: v4(),
            collection_log_id: collectionLogId,
            collection_log_entry_id: pageId,
            name: killCount.name,
            amount: randInt(500),
            created_at: date,
            updated_at: date,
          });
        });
      });
    });

    const collectionLog = {
      id: collectionLogId,
      user_id: user.id,
      unique_obtained: obtainedItems.filter((val, i, arr) => arr.indexOf(val) === i).length,
      unique_items: itemSet.length,
      created_at: date,
      updated_at: date,
    };
    collectionLogs.push(collectionLog);
  });

  await knex('collection_log_user').insert(users);
  await knex('collection_log_tab').insert(tabs);
  await knex('collection_log_entry').insert(pages);
  await knex('collection_log').insert(collectionLogs);
  await knex.batchInsert('collection_log_item', items, 1000);
  await knex.batchInsert('collection_log_kill_count', killCounts, 1000);
};