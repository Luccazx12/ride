import { AggregateRoot } from "../../domain/entity/account";
import { DatabaseConnection } from "../database/database-connection";
import { Model } from "./model";
import { ORM, FieldType } from "./orm";

export class SqlORM<M extends Model<any>> implements ORM<M> {
  public constructor(private readonly databaseConnection: DatabaseConnection) {}

  public async save(model: M): Promise<void> {
    const columns = model.columns.map((column) => column.column).join(",");
    const params = model.columns
      .map((_column, index: number) => `$${index + 1}`)
      .join(",");
    const values = model.columns.map(
      (column) => model[column.property as keyof M]
    );
    const query = `INSERT INTO ${model.schema}.${model.table} (${columns}) VALUES (${params})`;
    await this.databaseConnection.query(query, values);
  }

  public async findBy<ModelToFind extends Model<AggregateRoot>>(
    model: any,
    field: FieldType<ModelToFind>,
    value: string
  ): Promise<ModelToFind | null> {
    const prototypeFields = model.prototype.columns.find(
      (f: { property: string; column: string }) => f.property === field
    );
    if (!prototypeFields) return null;
    const query = `SELECT * from ${model.prototype.schema}.${model.prototype.table} WHERE ${prototypeFields.column} = $1`;
    const [data] = await this.databaseConnection.query(query, value);
    if (!data) return null;
    const modelObject = new model();
    for (const column of model.prototype.columns) {
      modelObject[column.property] = data[column.column];
    }
    return modelObject;
  }
}
