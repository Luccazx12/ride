import crypto from "crypto";
import {
  DatabaseConnection,
  PgPromiseAdapter,
} from "../../../src/infrastructure/database/database-connection";
import { AccountModel } from "../../../src/infrastructure/orm/account-model";
import { SqlORM } from "../../../src/infrastructure/orm/orm";
import { AccountBuilder } from "../../builders/account-builder";

describe("ORM (integration)", () => {
  let databaseConnection: DatabaseConnection;

  beforeAll(() => {
    databaseConnection = new PgPromiseAdapter();
  });

  afterAll(() => {
    databaseConnection.close();
  });

  it("should persist model in database", async () => {
    // given
    const aggregate = new AccountBuilder().build();
    const model = AccountModel.fromAggregate(aggregate);
    const orm = new SqlORM(databaseConnection);

    // when
    await orm.save(model);

    // then
    const persistedModel = await orm.findBy<AccountModel>(
      AccountModel,
      "accountId",
      model.accountId
    );
    expect(persistedModel).toEqual(model);
  });

  it("should retrieve Model from database", async () => {
    // given
    const aggregate = new AccountBuilder().build();
    const model = AccountModel.fromAggregate(aggregate);
    const orm = new SqlORM(databaseConnection);
    await orm.save(model);

    // when
    const persistedModel = await orm.findBy<AccountModel>(
      AccountModel,
      "accountId",
      model.accountId
    );

    // then
    expect(persistedModel).toEqual(model);
  });

  it("should return null when data is not found", async () => {
    // given
    const id = crypto.randomUUID();
    const orm = new SqlORM(databaseConnection);

    // when
    const persistedModel = await orm.findBy<AccountModel>(
      AccountModel,
      "accountId",
      id
    );

    // then
    expect(persistedModel).toEqual(null);
  });

  it("should update Model", () => {});

  it("should delete Model", () => {});
});
