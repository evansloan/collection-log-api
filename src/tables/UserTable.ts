import { AttributeMap } from 'aws-sdk/clients/dynamodb';

import BaseTable from './BaseTable';

export default class UserTable extends BaseTable {

  constructor() {
    super();
    this.tableName = `UserTable-${process.env.STAGE_NAME}`;
    this.primaryKey = 'user_id';
    this.attributes = [
      'user_id',
      'username',
    ];
  }

  /**
   * Find a user with the provided runelite ID.
   * Runelite ID is generated within the collection log plugin
   * 
   * @param runeliteId 
   * @returns User item or undefined
   */
  public async getByRuneliteId(runeliteId: string): Promise<AttributeMap | undefined> {
    const attributes = {
      runelite_id: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [runeliteId],
      },
    };
    return this.getByAttributes(attributes);
  }

  /**
   * Find a user with the provided username
   * 
   * @param {string} username
   * @returns User item or undefined
   */
  public async getByUsername(username: string): Promise<AttributeMap | undefined> {
    const attributes = {
      username: {
        ComparisonOperator: 'EQ',
        AttributeValueList: [username.toLowerCase()],
      },
    };
    return this.getByAttributes(attributes);
  }
}