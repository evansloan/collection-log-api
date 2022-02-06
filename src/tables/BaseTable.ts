import AWS from 'aws-sdk';
import { AttributeMap, DocumentClient, ItemList } from 'aws-sdk/clients/dynamodb';
import { v4 } from 'uuid';


export default class BaseTable {
  protected tableName: string = '';
  protected primaryKey: string = '';
  protected attributes: Array<string> = [];
  protected dynamoClient: DocumentClient;

  constructor() {
    this.dynamoClient = new AWS.DynamoDB.DocumentClient();
  }

  /**
   * Get an existing item in DB
   * 
   * @param {string} uuid Item uuid to retrieve
   * 
   * @returns {?AttributeMap} Existing item
   */
  public async get(uuid: string): Promise<AttributeMap | undefined> {
    const result = await this.dynamoClient.get({
      TableName: this.tableName,
      Key: {
        [this.primaryKey]: uuid,
      },
      AttributesToGet: this.attributes,
    }).promise();

    return result.Item;
  }

  /**
   * @param {any} data Data to insert into DB
   * 
   * @returns {any} Created item
   */
  public async create(data: any): Promise<any> {
    const item = {
      ...data,
      [this.primaryKey]: v4(),
    };

    await this.dynamoClient.put({
      TableName: this.tableName,
      Item: item,
    }).promise();

    return item;
  }

  /**
   * @param {string} uuid Item uuid to update
   * 
   * @returns {any} Updated item
   */
  public async update(uuid: string, data: any): Promise<any> {
    const item = {
      ...data,
      [this.primaryKey]: uuid,
    };

    await this.dynamoClient.put({
      TableName: this.tableName,
      Item: item,
    }).promise();

    return item;
  }

  /**
   * Find an item by specific attributes
   * 
   * @param {any} attributes Attributes to search items by 
   * @returns Item matching provided attributes or undefined
   */
  public async getByAttributes(attributes: any): Promise<AttributeMap | undefined> {
    let params: any = {
      TableName: this.tableName,
      ScanFilter: attributes,
      AttributesToGet: this.attributes,
    };

    let items: Array<AttributeMap> = [];
    let results;
    do {
        results =  await this.dynamoClient.scan(params).promise();
        results.Items?.forEach((item) => items.push(item));
        params.ExclusiveStartKey = results.LastEvaluatedKey;
    } while (typeof results.LastEvaluatedKey !== 'undefined');


    if (items.length < 1) {
      return undefined;
    }

    return items[0];
  }

  /**
   * Find all items by specific attributes
   * 
   * @param {any} attributes Attributes to search by 
   * @returns Array of items matching attributes or null undefined
   */
  public async getAllByAttributes(attributes: any): Promise<Array<AttributeMap> | undefined> {
    const params: any = {
      TableName: this.tableName,
      ScanFilter: attributes,
      AttributesToGet: this.attributes,
    };

    let items: Array<AttributeMap> = [];
    let results;
    do {
        results =  await this.dynamoClient.scan(params).promise();
        results.Items?.forEach((item) => items.push(item));
        params.ExclusiveStartKey = results.LastEvaluatedKey;
    } while (typeof results.LastEvaluatedKey !== 'undefined');

    return items;
  }
}
