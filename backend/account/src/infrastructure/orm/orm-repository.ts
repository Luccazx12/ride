import { AggregateRoot } from "../../domain/entity/account";
import { Model } from "./model";
import { ORM, FieldType } from "./orm";

export abstract class ORMRepository<
  Aggregate extends AggregateRoot,
  M extends Model<Aggregate>
> {
  public constructor(
    protected readonly orm: ORM<M>,
    private readonly model: { fromAggregate: (aggregate: Aggregate) => M }
  ) {}

  protected async findBy(
    model: any,
    field: FieldType<M>,
    value: string
  ): Promise<Aggregate | null> {
    const modelData = await this.orm.findBy(model, field, value);
    if (!modelData) return null;
    return modelData.toAggregate();
  }

  public async save(aggregate: Aggregate): Promise<void> {
    return this.orm.save(this.model.fromAggregate(aggregate));
  }
}
