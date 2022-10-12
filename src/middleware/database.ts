import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { Knex } from 'knex';
import middy from 'middy';
import { Model } from 'objection';

import { DatabaseService } from '@services/database';

export interface DatabaseContext extends Context {
  database: Knex<any, unknown[]>;
}

export class DatabaseMiddleware implements middy.MiddlewareObject<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
  private static instance: DatabaseMiddleware;

  private readonly service: DatabaseService;

  constructor() {
    this.service = new DatabaseService();
    Model.knex(this.service.getConnection());
  }

  public static getInstance() {
    if (!DatabaseMiddleware.instance) {
      DatabaseMiddleware.instance = new DatabaseMiddleware();
    }

    return DatabaseMiddleware.instance;
  }

  public before: middy.MiddlewareFunction<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async ({ context }) => {
    const databaseContext = context as DatabaseContext;
    databaseContext.database = this.service.getConnection();
  };
}

export default DatabaseMiddleware.getInstance;
