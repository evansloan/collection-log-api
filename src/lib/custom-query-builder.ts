/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Model, Page, PartialModelObject, QueryBuilder } from 'objection';

interface Options {
  columnName: string;
  deletedValue: Date;
}

let options: Options;

/**
 * Custom query builder implementation to handle soft deletes,
 * auto created/updated dates, and hidden attributes
 */
export class CustomQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
  public ArrayQueryBuilderType!: CustomQueryBuilder<M, M[]>;
  public SingleQueryBuilderType!: CustomQueryBuilder<M, M>;
  public MaybeSingleQueryBuilderType!: CustomQueryBuilder<M, M | undefined>;
  public NumberQueryBuilderType!: CustomQueryBuilder<M, number>;
  public PageQueryBiulderType!: CustomQueryBuilder<M, Page<M>>;

  public execute(): Promise<R> {
    if (this.isFind() && !this.context().includeDeleted) {
      const tableRef = this.tableRefFor(this.modelClass() as typeof Model);
      this.whereNull(`${tableRef}.${options.columnName}`);
    }

    return super.execute();
  }

  public delete(): this['NumberQueryBuilderType'] {
    this.context({
      deletedAt: new Date(),
    });

    const patch: PartialModelObject<M> = {};
    patch[options.columnName] = options.deletedValue;

    return this.patch(patch);
  }

  public hardDelete(): this['NumberQueryBuilderType'] {
    return super.delete();
  }

  public unDelete(): this['NumberQueryBuilderType'] {
    this.context({
      undelete: true,
    });
    const patch: PartialModelObject<M> = {};
    patch[options.columnName] = null;
    return this.patch(patch);
  }

  public includeDeleted(): this {
    return this.context({ includeDeleted: true });
  }

  public visible(...visible: string) {
    this.context({ visible });
    return this;
  }
}

type Constructor<T> = new (...args: any[]) => T;

export const CustomQueryBuilderMixin = (passedOptions?: Options) => {
  options = {
    columnName: 'deleted_at',
    deletedValue: new Date(),
    ...passedOptions,
  };

  return function <T extends Constructor<Model>>(Base: T): T {
    return class extends Base {
      public QueryBuilderType!: CustomQueryBuilder<this>;
      public static QueryBuilder: CustomQueryBuilder;

      public static modifiers = {
        includeDeleted(query: CustomQueryBuilder<Model>): void {
          query.includeDeleted();
        },
      };
    };
  };
};