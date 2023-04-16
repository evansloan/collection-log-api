import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import _ from 'lodash';
import middy from '@middy/core';

export class SnakeCaseParseMiddleware implements middy.MiddlewareObj<APIGatewayProxyEventV2, APIGatewayProxyResultV2> {
  private static instance: SnakeCaseParseMiddleware;

  public static getInstance() {
    if (!SnakeCaseParseMiddleware.instance) {
      SnakeCaseParseMiddleware.instance = new SnakeCaseParseMiddleware();
    }

    return SnakeCaseParseMiddleware.instance;
  }

  public before: middy.MiddlewareFn<APIGatewayProxyEventV2, APIGatewayProxyResultV2> = async ({ event }) => {
    const { body } = event;

    if (!body) {
      return;
    }

    const camelize = (obj: any) => _.transform(obj, (acc: any, value: any, key, target) => {
      if (!_.isArray(target) && (key as string).includes('_')) {
        key = _.camelCase(key as string);
      }
      acc[key] = _.isObject(value) ? camelize(value) : value;
    });

    // Convert snake_case JSON keys to camelCase and assign back to event
    const ccJson = camelize(JSON.parse(body));
    event.body = JSON.stringify(ccJson);
  };
}

export default SnakeCaseParseMiddleware.getInstance;
