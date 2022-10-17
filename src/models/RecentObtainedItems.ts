import { ColumnNameMappers, Model } from 'objection';

export default class RecentObtainedItems extends Model {
  name!: string;
  itemId!: number;
  quantity!: number;
  obtained!: boolean;
  obtainedAt?: Date;
  username!: string;

  static tableName = 'recent_obtained_items';

  static columnNameMappers: ColumnNameMappers = {
    parse(obj) {
      return {
        name: obj.name,
        id: obj.item_id,
        quantity: obj.quantity,
        obtained: obj.obtained,
        obtainedAt: obj.obtained_at,
        username: obj.username,
      };
    },
    format(obj) {
      return {
        name: obj.name,
        item_id: obj.itemId,
        quantity: obj.quantity,
        obtained: obj.obtained,
        obtained_at: obj.obtainedAt,
        username: obj.username,
      };
    },
  };
}
