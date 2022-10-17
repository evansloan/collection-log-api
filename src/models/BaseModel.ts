/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import _ from 'lodash';
import { Model, Pojo, QueryContext } from 'objection';

import { CustomQueryBuilder, CustomQueryBuilderMixin } from '@lib/custom-query-builder';

const queryBuilderMixin = CustomQueryBuilderMixin();
const MixedModel = queryBuilderMixin(Model);

export class BaseModel extends MixedModel {
  static get QueryBuilder() {
    return CustomQueryBuilder;
  }

  public static get hidden(): string[] {
    return [];
  }

  public QueryBuilderType!: CustomQueryBuilder<this>;

  id!: string;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;

  async $afterFind(queryContext: QueryContext) {
    const { visible } = queryContext;
    const { hidden } = this.constructor;

    if (hidden.length > 0) {
      const unset = _.difference(hidden, visible);
      for (const property of unset) {
        const prop = property as string;
        delete this[prop];
      }
    }
  }

  $beforeInsert(): void | Promise<any> {
    const date = new Date();
    if (!this.createdAt) {
      this.createdAt = date;
    }
    this.updatedAt = date;
  }

  async $beforeUpdate(): void | Promise<any> {
    this.updatedAt = new Date();
  }

  protected static defaultParse(obj: Pojo) {
    return {
      id: obj.id,
      createdAt: obj.created_at,
      updatedAt: obj.updated_at,
      deletedAt: obj.deleted_at,
    };
  }

  protected static defaultFormat(obj: Pojo) {
    return {
      id: obj.id,
      created_at: obj.createdAt,
      updated_at: obj.updatedAt,
      deleted_at: obj.deletedAt,
    };
  }
}