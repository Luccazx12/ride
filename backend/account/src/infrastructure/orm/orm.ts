import {
  FieldType,
  Model,
  ModelPrototypeColumn,
  PrototypeModel,
} from "./model";
import { AggregateRoot } from "../../domain/entity/account";

export abstract class ORM<
  A extends AggregateRoot = any,
  M extends Model<A> = any
> {
  public abstract save(model: M): Promise<void>;
  public abstract updateBy(
    model: M,
    field: FieldType<M>,
    value: string
  ): Promise<void>;
  public abstract deleteBy(
    model: M,
    field: FieldType<M>,
    value: string
  ): Promise<void>;
  public abstract findBy(
    newableModel: PrototypeModel<A, M>,
    field: FieldType<M>,
    value: string
  ): Promise<M | null>;

  protected getQueryValues(model: M): unknown[] {
    return model.columns.map((column) => model[column.property]);
  }

  protected getModelColumnByProperty<
    ModelColumn extends ModelPrototypeColumn<M>
  >(columns: Array<ModelColumn>, field: FieldType<M>): ModelColumn {
    const column = columns.find((column) => column.property === field);
    if (!column)
      throw new Error(
        `ModelColumn related to field ${field.toString()} not found`
      );
    return column;
  }
}
