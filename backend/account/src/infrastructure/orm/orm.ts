import { Model } from "./model";

export type FieldType<Model> = Exclude<
  keyof Model,
  "schema" | "table" | "columns" | "toAggregate"
>;

export interface ORM<M extends Model<any>> {
  save(model: M): Promise<void>;
  // update(model: M): Promise<void>;
  // delete(model: M): Promise<void>;
  findBy(model: any, field: FieldType<M>, value: string): Promise<M | null>;
}

