import Cache from '@lib/cache/cache';
import { response } from '@utils/handler-utils';
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import middy from '@middy/core';

class CacheMiddleware<T> implements middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {

  private key = '';

  constructor(private cache: Cache<T>, private param: string) {}

  public before: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async ({ event }) => {
    let cacheItem = undefined;
    if (event.pathParameters) {
      this.key = event.pathParameters[this.param] as string;
      this.key = this.key.toLowerCase().trim();
      cacheItem = this.cache.get(this.key);
    }

    if (cacheItem) {
      console.log(`[${this.cache.name}-cache] RETRIEVED ${this.key}`);
      return response(200, cacheItem.value);
    }

    console.log(`[${this.cache.name}-cache] MISS ${this.key}`);
  };

  public after: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async ({ response }) => {
    const cacheItem = JSON.parse((response as any)?.body);
    this.cache.add(this.key, cacheItem);
  };
}

export const cache = <T>(cache: Cache<T>, param: string) => {
  return new CacheMiddleware(cache, param);
};

export default CacheMiddleware;
