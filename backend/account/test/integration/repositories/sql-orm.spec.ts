import crypto from "crypto";
import {
  DatabaseConnection,
  PgPromiseAdapter,
} from "../../../src/infrastructure/database/database-connection";
import { AccountModel } from "../../../src/infrastructure/repository/account-model";
import { SqlORM } from "../../../src/infrastructure/orm/sql-orm";
import { AccountBuilder } from "../../builders/account-builder";
import { FieldType } from "../../../src/infrastructure/orm/model";
import { Account } from "../../../src/domain/entity/account";

describe("SqlORM (integration)", () => {
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
    const orm = new SqlORM<Account, AccountModel>(databaseConnection);

    // when
    await orm.save(model);

    // then
    const persistedModel = await orm.findBy(
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
    const orm = new SqlORM<Account, AccountModel>(databaseConnection);
    await orm.save(model);

    // when
    const persistedModel = await orm.findBy(
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
    const orm = new SqlORM<Account, AccountModel>(databaseConnection);

    // when
    const persistedModel = await orm.findBy(AccountModel, "accountId", id);

    // then
    expect(persistedModel).toEqual(null);
  });

  it("should throw error when column is not mapped", async () => {
    // given
    const id = crypto.randomUUID();
    const orm = new SqlORM<Account, AccountModel>(databaseConnection);
    const fieldName = "test";

    // when
    const findPromise = () =>
      orm.findBy(AccountModel, fieldName as FieldType<AccountModel>, id);

    // then
    expect(findPromise).rejects.toThrow(
      Error(`ModelColumn related to field ${fieldName} not found`)
    );
  });

  it("should update the model preserving PK fields", async () => {
    // given
    const aggregate = new AccountBuilder().build();
    const model = AccountModel.fromAggregate(aggregate);
    const orm = new SqlORM<Account, AccountModel>(databaseConnection);
    await orm.save(model);
    const persistedModel = await orm.findBy(
      AccountModel,
      "accountId",
      model.accountId
    );

    // when
    const modelToUpdate = AccountModel.fromAggregate(
      new AccountBuilder().build()
    );
    await orm.updateBy(modelToUpdate, "accountId", model.accountId);

    // then
    expect(persistedModel).toEqual(model);
    const updatedModel = await orm.findBy(
      AccountModel,
      "accountId",
      model.accountId
    );
    expect(updatedModel).toEqual({
      ...modelToUpdate,
      accountId: model.accountId,
    });
  });

  it("should delete Model", async () => {
    // given
    const aggregate = new AccountBuilder().build();
    const model = AccountModel.fromAggregate(aggregate);
    const orm = new SqlORM<Account, AccountModel>(databaseConnection);
    await orm.save(model);
    const persistedModel = await orm.findBy(
      AccountModel,
      "accountId",
      model.accountId
    );

    // when
    await orm.deleteBy(model, "accountId", model.accountId);

    // then
    expect(persistedModel).toEqual(model);
    const deletedModel = await orm.findBy(
      AccountModel,
      "accountId",
      model.accountId
    );
    expect(deletedModel).toEqual(null);
  });
});
