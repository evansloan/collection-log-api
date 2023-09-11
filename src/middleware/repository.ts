import {
  APIGatewayProxyEventV2, APIGatewayProxyHandlerV2,
  APIGatewayProxyResultV2,
  APIGatewayProxyStructuredResultV2,
  Callback,
  Context,
} from 'aws-lambda';
import middy from '@middy/core';

import CollectionLogRepository from '@repositories/collection-log';
import ItemsRepository from '@repositories/items';
import KillCountsRepository from '@repositories/kill-counts';

export type RepositoryHandler<T = never> = (
  event: APIGatewayProxyEventV2,
  context: RepositoryContext,
  callback: Callback<APIGatewayProxyStructuredResultV2 | string | T>
) => (void | Promise<APIGatewayProxyStructuredResultV2 | string | T>);

export interface RepositoryContext extends Context {
  repositories: {
    clRepo: CollectionLogRepository;
    itemsRepo: ItemsRepository;
    kcRepo: KillCountsRepository;
  };
}

export class RepositoryMiddleware implements middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
  private static instance: RepositoryMiddleware;

  private clRepo: CollectionLogRepository;
  private itemsRepo: ItemsRepository;
  private kcRepo: KillCountsRepository;

  constructor() {
    this.clRepo = new CollectionLogRepository();
    this.itemsRepo = new ItemsRepository();
    this.kcRepo = new KillCountsRepository();
  }

  public static getInstance() {
    if (!RepositoryMiddleware.instance) {
      RepositoryMiddleware.instance = new RepositoryMiddleware();
    }

    return RepositoryMiddleware.instance;
  }

  public before: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async ({ context }) => {
    const repositoryContext = context as RepositoryContext;
    repositoryContext.repositories = {
      clRepo: this.clRepo,
      itemsRepo: this.itemsRepo,
      kcRepo: this.kcRepo,
    };
  };
}

export default RepositoryMiddleware.getInstance;
