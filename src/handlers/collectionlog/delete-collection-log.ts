import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { errorResponse, successResponse } from '@utils/handler-utils';
import CollectionLogUser from '@models/CollectionlogUser';
import CollectionLogItem from '@models/CollectionLogItem';
import CollectionLogKillCount from '@models/CollectionLogKillCount';
import CollectionLog from '@models/CollectionLog';

const deleteCollectionLog: APIGatewayProxyHandlerV2 = async (event) => {
  const body = JSON.parse(event.body as string);

  if (!body.accountHash || !body.username) {
    return errorResponse(40, 'Invalid post body');
  }

  const { accountHash, username } = body;

  const collectionLogUser = await CollectionLogUser.query().findOne({
    account_hash: accountHash,
    username,
  });

  if (!collectionLogUser) {
    return errorResponse(404, `Unable to find user to delete for ${username}`);
  }

  const collectionLog = await collectionLogUser.$relatedQuery('collectionLog');
  if (!collectionLog) {
    return errorResponse(404, `Unable to find collection log for user ${username}`);
  }

  console.log(`DELETING COLLECTION LOG ITEMS FOR ${username}`);
  await CollectionLogItem.query()
    .delete()
    .where({ collection_log_id: collectionLog.id });

  console.log(`DELETING COLLECTION LOG KILL COUNT FOR ${username}`);
  await CollectionLogKillCount.query()
    .delete()
    .where({ collection_log_id: collectionLog.id });

  console.log(`DELETING COLLECTION LOG FOR ${username}`);
  await CollectionLog.query().deleteById(collectionLog.id);

  console.log(`DELETING COLLECTION LOG USER FOR ${username}`);
  await CollectionLogUser.query().deleteById(collectionLogUser.id);

  return successResponse(200, 'Collection log deleted');
};

export const handler = middleware(deleteCollectionLog);
