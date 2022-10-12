import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

import { middleware } from '@middleware/common';
import { DatabaseContext } from '@middleware/database';
import { CollectionLog, CollectionLogItem, CollectionLogUser } from '@models/index';
import { headers } from '@utils/handler-utils';

const recentItemsGlobal: APIGatewayProxyHandlerV2 = async (event, context) => {
  const dbContext = context as DatabaseContext;
  // TODO: use query builder
  const items = await dbContext.database.raw(`
    WITH user_items AS (
      SELECT
        name,
        item_id,
        quantity,
        obtained,
        obtained_at,
        collection_log_id,
        ROW_NUMBER() OVER (PARTITION BY collection_log_id ORDER BY obtained_at DESC, name)
      FROM
        ${CollectionLogItem.tableName}
      WHERE obtained
        AND deleted_at IS NULL
        AND obtained_at >= NOW() - INTERVAL '10 DAYS'
    )
    SELECT
      ui.name AS name,
      ui.item_id AS id,
      ui.quantity AS quantity,
      ui.obtained AS obtained,
      ui.obtained_at AS "obtainedAt",
      clu.username AS username
    FROM
      user_items ui
      JOIN ${CollectionLog.tableName} cl ON cl.id = ui.collection_log_id
      JOIN ${CollectionLogUser.tableName} clu ON clu.id = cl.user_id
    WHERE ui.row_number = 1
      AND cl.deleted_at IS NULL
      AND clu.deleted_at IS NULL
    ORDER BY
      ui.obtained_at DESC
    LIMIT 30;
  `);

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ items: items.rows }),
  };
};

export const recentItemsGlobalHandler = middleware(recentItemsGlobal);
