import { faker } from "@faker-js/faker";
import { SqlAccountRepository } from "../../src/DAO/account-repository";
import { AccountBuilder } from "../builders/account-builder";

describe("SqlAccountRepository (integration)", () => {
  describe("save", () => {
    it("should create account", async () => {
      // given
      const dao = new SqlAccountRepository();
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
      const dao = new SqlAccountRepository();
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
      const dao = new SqlAccountRepository();

      // when
      const foundAccount = await dao.getById(faker.string.uuid());

      // then
      expect(foundAccount).toBeNull();
    });
  });

  describe("getByEmail", () => {
    it("should get account by email", async () => {
      // given
      const dao = new SqlAccountRepository();
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
      const dao = new SqlAccountRepository();

      // when
      const foundAccount = await dao.getByEmail(faker.internet.email());

      // then
      expect(foundAccount).toBeNull();
    });
  });
});
