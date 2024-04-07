import pgp from "pg-promise";
import pg from "pg-promise/typescript/pg-subset";

export interface DatabaseConnection {
  query<QueryResult = any>(
    statement: string,
    params: any
  ): Promise<QueryResult>;
  close(): Promise<void>;
}

export class PgPromiseAdapter implements DatabaseConnection {
  private readonly connection: pgp.IDatabase<{}, pg.IClient>;

  public constructor() {
    this.connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  }

  public async query(statement: string, params: any): Promise<any> {
    return this.connection.query(statement, params);
  }

  public async close(): Promise<void> {
    this.connection.$pool.end();
  }
}
