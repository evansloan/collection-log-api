import CollectionLog from '@models/CollectionLog';
import { CollectionLogKillCount } from '@models/index';
import Repository from '@repositories/repository';

class KillCountsRepository extends Repository<CollectionLogKillCount> {

  protected model = CollectionLogKillCount;

  public async fetchPage(
    collectionLog: CollectionLog,
    pageName: string,
    params: {
      select?: any;
      limit?: number;
      offset?: number;
    }) {
    let query = collectionLog.$relatedQuery('killCounts')
      .joinRelated('page')
      .whereLower('page.name', pageName.toLowerCase())
      .orderBy('sequence', 'ASC');

    query = this.applyParams(query, params);

    return await query;
  }

  public fetchWithRelated = async (collectionLog: CollectionLog) => {
    return collectionLog.$relatedQuery('killCounts')
      .withGraphJoined('page.[tab]')
      .orderBy('page:tab.name', 'ASC')
      .orderBy('page.name', 'ASC')
      .orderBy('sequence', 'ASC');
  };
}

export default KillCountsRepository;
