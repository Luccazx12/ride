import { AggregateRoot } from "../../domain/entity/account";
import { FieldType, Model, PrototypeModel, StaticModel } from "./model";
import { ORM } from "./orm";

export abstract class ORMRepository<
  A extends AggregateRoot,
  M extends Model<A>
> {
  public constructor(
    protected readonly orm: ORM<A, M>,
    private readonly model: StaticModel<A, M>
  ) {}

  protected async findBy(
    model: PrototypeModel<A, M>,
    field: FieldType<M>,
    value: string
  ): Promise<A | null> {
    const modelData = await this.orm.findBy(model, field, value);
    if (!modelData) return null;
    return modelData.toAggregate();
  }

  protected async updateBy(
    aggregate: A,
    field: FieldType<M>,
    value: string
  ): Promise<void> {
    return this.orm.updateBy(this.mapToModel(aggregate), field, value);
  }

  protected async deleteBy(
    aggregate: A,
    field: FieldType<M>,
    value: string
  ): Promise<void> {
    return this.orm.deleteBy(this.mapToModel(aggregate), field, value);
  }

  public async save(aggregate: A): Promise<void> {
    return this.orm.save(this.mapToModel(aggregate));
  }

  private mapToModel(aggregate: A): M {
    return this.model.fromAggregate(aggregate);
  }
}
