import { AggregateRoot } from "../../domain/entity/account";

export type StaticModel<A extends AggregateRoot, M extends Model<A>> = {
  fromAggregate: (aggregate: A) => M;
};

export type FieldType<Model> = Exclude<
  keyof Model,
  "schema" | "table" | "columns" | "toAggregate"
>;

export type ModelPrototypeColumn<M> = {
  property: FieldType<M>;
  column: string;
  isPk: boolean;
};

export interface PrototypeModel<A extends AggregateRoot, M extends Model<A>> {
  new (...args: any): M;
  prototype: {
    columns: ModelPrototypeColumn<M>[];
    schema: string;
    table: string;
  };
}

export abstract class Model<A extends AggregateRoot> {
  declare schema: string;
  declare table: string;
  declare columns: ModelPrototypeColumn<Model<A>>[];
  public abstract toAggregate(): A;
}

export function ModelDecorator(schema: string, table: string) {
  return function <M extends Model<any>>(
    classConstructor: PrototypeModel<AggregateRoot, M>
  ) {
    classConstructor.prototype.schema = schema;
    classConstructor.prototype.table = table;
  };
}

export function ColumnDecorator(
  name: string,
  properties: { isPk: boolean } = {
    isPk: false,
  }
) {
  return function <A extends AggregateRoot>(
    target: Model<A>,
    propertyKey: string
  ) {
    target.columns = target.columns || [];
    target.columns.push({
      property: propertyKey as never,
      column: name,
      isPk: properties.isPk,
    });
  };
}
