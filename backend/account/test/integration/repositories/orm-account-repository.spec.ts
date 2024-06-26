import { faker } from "@faker-js/faker";
import { ORMAccountRepository } from "../../../src/infrastructure/repository/orm-account-repository";
import { AccountBuilder } from "../../builders/account-builder";
import {
  DatabaseConnection,
  PgPromiseAdapter,
} from "../../../src/infrastructure/database/database-connection";
import { SqlORM } from "../../../src/infrastructure/orm/sql-orm";

describe("ORMAccountRepository (integration)", () => {
  let databaseConnection: DatabaseConnection;

  beforeAll(() => {
    databaseConnection = new PgPromiseAdapter();
  });

  afterAll(() => databaseConnection.close());

  describe("save", () => {
    it("should create account", async () => {
      // given
      const dao = new ORMAccountRepository(new SqlORM(databaseConnection));
      const account = new AccountBuilder().build();

      // when
      await dao.save(account);

      // then
      const foundAccount = await dao.getById(account.accountId);
      expect(foundAccount).toEqual(account);
    });
  });

  describe("getById", () => {
    it("should get account by id", async () => {
      // given
      const dao = new ORMAccountRepository(new SqlORM(databaseConnection));
      const account = new AccountBuilder().build();

      await dao.save(account);

      // when
      const foundAccount = await dao.getById(account.accountId);

      // then
      expect(foundAccount).toBeDefined();
      expect(foundAccount).toEqual(account);
    });

    it("should return null when account is not found by id", async () => {
      // given
      const dao = new ORMAccountRepository(new SqlORM(databaseConnection));

      // when
      const foundAccount = await dao.getById(faker.string.uuid());

      // then
      expect(foundAccount).toBeNull();
    });
  });

  describe("getByEmail", () => {
    it("should get account by email", async () => {
      // given
      const dao = new ORMAccountRepository(new SqlORM(databaseConnection));
      const account = new AccountBuilder().build();

      await dao.save(account);

      // when
      const foundAccount = await dao.getByEmail(account.email);

      // then
      expect(foundAccount).toBeDefined();
      expect(foundAccount).toEqual(account);
    });

    it("should return null when account is not found by id", async () => {
      // given
      const dao = new ORMAccountRepository(new SqlORM(databaseConnection));

      // when
      const foundAccount = await dao.getByEmail(faker.internet.email());

      // then
      expect(foundAccount).toBeNull();
    });
  });
});
