import CollectionLog from '@models/CollectionLog';
import { CollectionLogItem } from '@models/index';
import Repository from '@repositories/repository';
import { raw } from 'objection';

class ItemsRepository extends Repository<CollectionLogItem> {

  protected model = CollectionLogItem;

  public async fetchPage(
    collectionLog: CollectionLog,
    pageName: string,
    params: {
      select?: any;
      limit?: number;
      offset?: number;
    }) {
    let query = collectionLog.$relatedQuery('items')
      .modify(this.genderModifier(collectionLog.user.isFemale))
      .joinRelated('page')
      .whereLower('page.name', pageName.toLowerCase())
      .orderBy('sequence', 'ASC');

    query = this.applyParams(query, params);

    return await query;
  }

  public async fetchWithRelated(collectionLog: CollectionLog, filterGender: boolean) {
    const query = collectionLog.$relatedQuery('items')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC')
      .orderBy('sequence', 'ASC');

    if (filterGender) {
      query?.modify(this.genderModifier(collectionLog.user.isFemale));
    }

    return query;
  }

  public async fetchRecent(collectionLog: CollectionLog, limit?: number) {
    let query = collectionLog.$relatedQuery('items')
      .modify(this.genderModifier(collectionLog.user.isFemale))
      .select({
        id: 'item_id',
        obtained: raw('BOOL_OR(obtained)'),
      })
      .max('name AS name')
      .max('quantity AS quantity')
      .max('obtained_at AS obtained_at')
      .where('obtained', true)
      .groupBy('item_id')
      .orderBy(raw('MAX(obtained_at)'), 'DESC');

    query = this.applyParams(query,{ limit });

    return await query;
  }

  private genderModifier(isFemale: boolean) {
    return isFemale ? 'femaleItems' : 'maleItems';
  }
}

export default ItemsRepository;
