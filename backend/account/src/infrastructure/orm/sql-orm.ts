import { AggregateRoot } from "../../domain/entity/account";
import { DatabaseConnection } from "../database/database-connection";
import {
  FieldType,
  Model,
  ModelPrototypeColumn,
  PrototypeModel,
} from "./model";
import { ORM } from "./orm";

export class SqlORM<A extends AggregateRoot, M extends Model<A>> extends ORM<
  A,
  M
> {
  public constructor(private readonly databaseConnection: DatabaseConnection) {
    super();
  }

  public async save(model: M): Promise<void> {
    const { columns, params } = this.generateColumnsAndParams(model.columns);
    const values = this.getQueryValues(model);
    const query = `INSERT INTO ${model.schema}.${model.table} (${columns}) VALUES (${params})`;
    await this.databaseConnection.query(query, values);
  }

  public async updateBy(
    model: M,
    field: FieldType<M>,
    value: string
  ): Promise<void> {
    const updateColumns = model.columns
      .filter((column) => !column.isPk)
      .map((column, index) => `${column.column} = $${index + 2}`)
      .join(",");
    const modelColumn = this.getModelColumnByProperty(model.columns, field);
    const values = this.getQueryValues(model).filter(
      (_, index) => !model.columns[index].isPk
    );
    const query = `UPDATE ${model.schema}.${model.table} SET ${updateColumns} WHERE ${modelColumn?.column} = $1`;
    await this.databaseConnection.query(query, [value, ...values]);
  }

  public async deleteBy(
    model: M,
    field: FieldType<M>,
    value: string
  ): Promise<void> {
    const modelColumn = this.getModelColumnByProperty(model.columns, field);
    const query = `DELETE FROM ${model.schema}.${model.table} WHERE ${modelColumn.column} = $1`;
    await this.databaseConnection.query(query, value);
  }

  public async findBy(
    model: PrototypeModel<A, M>,
    field: FieldType<M>,
    value: string
  ): Promise<M | null> {
    const modelColumn = this.getModelColumnByProperty(
      model.prototype.columns,
      field
    );
    const query = `SELECT * from ${model.prototype.schema}.${model.prototype.table} WHERE ${modelColumn.column} = $1`;
    const [data] = await this.databaseConnection.query(query, value);
    if (!data) return null;
    const modelObject = new model();
    model.prototype.columns.forEach(
      (column) => (modelObject[column.property] = data[column.column])
    );
    return modelObject;
  }

  private generateColumnsAndParams(columns: ModelPrototypeColumn<M>[]) {
    const columnNames = columns.map((column) => column.column).join(",");
    const params = columns.map((_column, index) => `$${index + 1}`).join(",");
    return { columns: columnNames, params };
  }
}
