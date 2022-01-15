import AWS from 'aws-sdk';
import { AttributeMap } from 'aws-sdk/clients/dynamodb';

import BaseTable from './BaseTable';

export default class CollectionLogTable extends BaseTable {

  constructor() {
    super();
    this.tableName = `CollectionLogTable-${process.env.STAGE_NAME}`;
    this.primaryKey = 'collectionlog_id';
    this.attributes = [
      'collectionlog_id',
      'collection_log',
      'user_id',
    ];
  }

  /**
   * Find a collection log belonging to the provider user item
   * 
   * @param {AttributeMap | undefined} user 
   * @returns Collection log item or undefined
   */
  public async getByUser(user: AttributeMap | undefined): Promise<AttributeMap | undefined> {
    if (!user) {
      return undefined;
    }

    const attributes = {
      user_id: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [user.user_id]
      }
    }
    return await this.getByAttributes(attributes);
  }
}