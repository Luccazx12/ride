import { faker } from "@faker-js/faker";
import { SignupOutput } from "../../src/dtos/signup-output";
import { GetAccount } from "../../src/get-account";
import { Signup } from "../../src/signup";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { AccountDAO } from "../../src/DAO/account-dao";
import { InMemoryAccountDAO } from "../doubles/in-memory-account-dao";
import { Account } from "../../src/dtos/account";
import { NoopMailerGateway } from "../../src/mailer-gateway";

interface Subject {
  getAccount: GetAccount;
  accountDAO: AccountDAO;
}

const createSubject = (): Subject => {
  const accountDAO = new InMemoryAccountDAO();
  return {
    accountDAO,
    getAccount: new GetAccount(accountDAO),
  };
};

describe("GetAccount", () => {
  it("should return account when account is found by id", async () => {
    // given
    const signupInput = new SignUpInputBuilder().build();
    const { accountDAO, getAccount } = createSubject();
    const signup = new Signup(accountDAO, new NoopMailerGateway());
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;

    // when
    const account = (await getAccount.execute(
      signupOutput.accountId
    )) as Account;

    // then
    expect(account).not.toBeNull();
    expect(account.accountId).toEqual(signupOutput.accountId);
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.isPassenger).toBe(signupInput.isPassenger);
    expect(account.isDriver).toBe(signupInput.isDriver);
    expect(account.carPlate).toBe(signupInput.carPlate);
  });

  it("should return null when account is not found by id", async () => {
    // given
    const accountId = faker.string.uuid();
    const { getAccount } = createSubject();

    // when
    const account = await getAccount.execute(accountId);

    // then
    expect(account).toBeNull();
  });
});
