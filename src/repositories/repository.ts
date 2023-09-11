import { CustomQueryBuilder } from '@lib/custom-query-builder';
import { BaseModel } from '@models/BaseModel';
import { ColumnRefOrOrderByDescriptor } from 'objection';

export interface RepositoryQueryParams<T> {
  columns?: Partial<T>;
  order?: ColumnRefOrOrderByDescriptor[];
  limit?: number;
}

abstract class Repository<T extends BaseModel> {

  protected model = BaseModel;

  public find = (params?: RepositoryQueryParams<T>) => {
    let query = this.model.query();
    query = this.applyParams(query, params ?? {});
    return query;
  };

  public create = async (data: Partial<T>) => {
    return this.model.query().insert(data);
  };

  protected applyParams<T extends BaseModel>(
    query: CustomQueryBuilder<T>,
    params: {
      select?: any;
      limit?: number;
      offset?: number;
  }) {

    const { select, limit, offset } = params ?? {};

    if (select) {
      query = query.select(select);
    }

    if (limit) {
      query = query.limit(limit);
    }

    if (offset) {
      query = query.offset(offset);
    }

    return query;
  }
}

export default Repository;
