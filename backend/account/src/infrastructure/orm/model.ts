import { AggregateRoot } from "../../domain/entity/account";

export abstract class Model<Aggregate extends AggregateRoot> {
  declare schema: string;
  declare table: string;
  declare columns: { property: string; column: string; isPk: boolean }[];
  public abstract toAggregate(): Aggregate;
}

export function ModelDecorator(schema: string, table: string) {
  return function (classConstructor: Function) {
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
  return function (target: any, propertyKey: string) {
    target.columns = target.columns || [];
    target.columns.push({
      property: propertyKey,
      column: name,
      isPk: properties.isPk,
    });
  };
}
