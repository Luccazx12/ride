import { faker } from "@faker-js/faker";
import { SignupOutput } from "../src/dtos/signup-output";
import { GetAccount } from "../src/get-account";
import { Signup } from "../src/signup";
import { SignUpInputBuilder } from "./builders/signup-input-builder";
import { AccountDAO, SqlAccountDAO } from "../src/DAO/account-dao";

interface Subject {
  getAccount: GetAccount;
  accountDAO: AccountDAO;
}

const createSubject = (): Subject => {
  const accountDAO = new SqlAccountDAO();
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
    const signup = new Signup(accountDAO);
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;

    // when
    const account = await getAccount.execute(signupOutput.accountId);

    // then
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.is_passenger).toBe(signupInput.isPassenger);
    expect(account.car_plate).toBe(signupInput.carPlate);
    expect(account.is_driver).toBe(signupInput.isPassenger);
  });

  it("should return null when account is not found by id", async () => {
    // given
    const accountId = faker.string.uuid();
    const { getAccount } = createSubject();

    // when
    const account = await getAccount.execute(accountId);

    // then
    expect(account).not.toBeNull();
  });
});
