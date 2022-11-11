import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DBError } from 'objection';

import { middleware } from '@middleware/common';
import { errorResponse, response } from '@utils/handler-utils';
import CollectionLogGroup from '@models/CollectionLogGroup';
import { v4 } from 'uuid';
import { parseModelValidationError } from '@utils/error-utils';
import { LambdaService } from '@services/lambda';
import CollectionLogUser from '@models/CollectionlogUser';

const createGroup: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body as string);
  const { groupUsers } = body;

  if (!groupUsers || groupUsers.length == 0) {
    return errorResponse(400, 'Cannot create a group without members');
  }

  const uuid = v4().replace(/-/g, '');
  const accessKey = `${uuid.slice(0, 3)}-${uuid.slice(3, 6)}-${uuid.slice(6, 9)}`;
  const groupUserCount = groupUsers.length;
  const userIds = groupUsers.map((user: CollectionLogUser) => user.id);

  try {
    const group = await CollectionLogGroup.query()
      .insertGraphAndFetch({
        ...body,
        accessKey,
        groupUserCount,
        groupUsers: groupUsers.map((user: CollectionLogUser) => ({ collectionLogUserId: user.id })),
      });

    const lambdaService = LambdaService.getInstance();
    await lambdaService.invoke('update-group-item-counts', {
      userIds,
      groupId: group.id,
    });

    return response(201, { group });
  } catch (e) {
    const err = e as typeof DBError;
    const parsed = parseModelValidationError(err, 'Group');
    return errorResponse(200, parsed);
  }
};

export const handler = middleware(createGroup);
