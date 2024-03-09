import { faker } from "@faker-js/faker";
import { SignupOutput } from "../../../src/dtos/signup-output";
import { GetAccount } from "../../../src/application/usecase/get-account";
import { Signup } from "../../../src/application/usecase/signup";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { AccountRepository } from "../../../src/infrastructure/repository/account-repository";
import { InMemoryAccountRepository } from "../../doubles/in-memory-account-repository";
import { NoopMailerGateway } from "../../../src/infrastructure/gateway/mailer-gateway";
import { GetAccountOutput } from "../../../src/dtos/get-account-output";

type Subject = {
  getAccount: GetAccount;
  accountRepository: AccountRepository;
};

const createSubject = (): Subject => {
  const accountRepository = new InMemoryAccountRepository();
  return {
    accountRepository,
    getAccount: new GetAccount(accountRepository),
  };
};

describe("GetAccount", () => {
  it("should return account when account is found by id", async () => {
    // given
    const signupInput = new SignUpInputBuilder().build();
    const { accountRepository, getAccount } = createSubject();
    const signup = new Signup(accountRepository, new NoopMailerGateway());
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
