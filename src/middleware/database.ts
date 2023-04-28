import { APIGatewayProxyEventV2, APIGatewayProxyResultV2, Context } from 'aws-lambda';
import { Knex } from 'knex';
import middy from '@middy/core';

import { DatabaseService } from '@services/database';

export interface DatabaseContext extends Context {
  database: Knex<any, unknown[]>;
}

class DatabaseMiddleware implements middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
  private static instance: DatabaseMiddleware;

  private readonly service: DatabaseService;

  constructor() {
    this.service = DatabaseService.getInstance();
  }

  public static getInstance() {
    if (!DatabaseMiddleware.instance) {
      DatabaseMiddleware.instance = new DatabaseMiddleware();
    }

    return DatabaseMiddleware.instance;
  }

  public before: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async ({ context }) => {
    const databaseContext = context as DatabaseContext;
    databaseContext.database = this.service.getConnection();
    databaseContext.callbackWaitsForEmptyEventLoop = false;
  };
}

export default DatabaseMiddleware.getInstance;
