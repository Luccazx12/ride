import { faker } from "@faker-js/faker";
import { SignupOutput } from "../../src/dtos/signup-output";
import { GetAccount } from "../../src/get-account";
import { Signup } from "../../src/signup";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { AccountRepository } from "../../src/DAO/account-repository";
import { InMemoryAccountRepository } from "../doubles/in-memory-account-dao";
import { NoopMailerGateway } from "../../src/mailer-gateway";
import { GetAccountOutput } from "../../src/dtos/get-account-output";

interface Subject {
  getAccount: GetAccount;
  AccountRepository: AccountRepository;
}

const createSubject = (): Subject => {
  const AccountRepository = new InMemoryAccountRepository();
  return {
    AccountRepository,
    getAccount: new GetAccount(AccountRepository),
  };
};

describe("GetAccount", () => {
  it("should return account when account is found by id", async () => {
    // given
    const signupInput = new SignUpInputBuilder().build();
    const { AccountRepository, getAccount } = createSubject();
    const signup = new Signup(AccountRepository, new NoopMailerGateway());
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;

    // when
    const account = (await getAccount.execute(
      signupOutput.accountId
    )) as GetAccountOutput;

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
