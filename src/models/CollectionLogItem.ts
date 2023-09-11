import { AnyQueryBuilder, ColumnNameMappers, Model, Modifiers } from 'objection';

import { BaseModel } from './BaseModel';
import { CollectionLog, CollectionLogPage } from '@models/index';

export default class CollectionLogItem extends BaseModel {
  name!: string;
  itemId!: number;
  quantity!: number;
  sequence!: number;
  obtained!: boolean;
  obtainedAt?: Date;
  collectionLogId!: string;
  collectionLogEntryId!: string;

  page!: CollectionLogPage;
  collectionLog!: CollectionLog;

  static tableName = 'collection_log_item';

  private static readonly FEMALE_ITEMS: number[] = [
    // Farming outfit
    13647,
    13643,
    13641,
    13645,
  ];

  private static readonly MALE_ITEMS: number[] = [
    // Farming outfit
    13646,
    13642,
    13640,
    13644,
  ];

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        ...BaseModel.defaultParse(obj),
        name: obj.name,
        itemId: obj.item_id,
        quantity: obj.quantity,
        sequence: obj.sequence,
        obtained: obj.obtained,
        obtainedAt: obj.obtained_at,
        collectionLogId: obj.collection_log_id,
        collectionLogEntryId: obj.collection_log_entry_id,
      };
    },
    format(obj) {
      return {
        ...BaseModel.defaultFormat(obj),
        name: obj.name,
        item_id: obj.itemId,
        quantity: obj.quantity,
        sequence: obj.sequence,
        obtained: obj.obtained,
        obtained_at: obj.obtainedAt,
        collection_log_id: obj.collectionLogId,
        collection_log_entry_id: obj.collectionLogEntryId,
      };
    },
  };

  static relationMappings = () => ({
    page: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLogPage,
      join: {
        from: 'collection_log_item.collection_log_entry_id',
        to: 'collection_log_entry.id',
      },
    },
    collectionLog: {
      relation: Model.BelongsToOneRelation,
      modelClass: CollectionLog,
      join: {
        from: 'collection_log_item.collection_log_id',
        to: 'collection_log.id',
      },
    },
  });

  static modifiers: Modifiers = {
    femaleItems: (query) => query.whereNotIn('item_id', CollectionLogItem.MALE_ITEMS),
    maleItems: (query) => query.whereNotIn('item_id', CollectionLogItem.FEMALE_ITEMS),
    withRelated: (query, filterGender?: boolean, isFemale?: string) => {
      query = query.withGraphJoined('page.[tab]')
        .orderBy('page:tab.name', 'ASC')
        .orderBy('page.name', 'ASC')
        .orderBy('sequence', 'ASC');

      if (filterGender) {
        const genderModifier = isFemale ? CollectionLogItem.modifiers.femaleItems
          : CollectionLogItem.modifiers.maleItems;

        query = query.modify(genderModifier);
      }

      return query;
    },
  };
}
