import { SignupInput } from "../../../src/dtos/signup-input";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { faker } from "@faker-js/faker";
import { SignupOutput } from "../../../src/dtos/signup-output";
import { GetAccount } from "../../../src/application/usecase/get-account";
import { Signup } from "../../../src/application/usecase/signup";
import { AccountRepository } from "../../../src/infrastructure/repository/account-repository";
import { InMemoryAccountRepository } from "../../doubles/in-memory-account-repository";
import { NoopMailerGateway } from "../../../src/infrastructure/gateway/mailer-gateway";
import { GetAccountOutput } from "../../../src/dtos/get-account-output";

type Fixture = {
  signupInput: SignupInput;
};

type Subject = {
  signup: Signup;
  accountRepository: AccountRepository;
};

const createFixture = (): Fixture => {
  return {
    signupInput: new SignUpInputBuilder().build(),
  };
};

const createSubject = (): Subject => {
  const accountRepository = new InMemoryAccountRepository();
  return {
    accountRepository,
    signup: new Signup(accountRepository, new NoopMailerGateway()),
  };
};

describe("Signup", () => {
  it("should create account for passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder()
      .withIsDriver(false)
      .withIsPassenger(true)
      .build();
    const { signup, accountRepository } = createSubject();

    // when
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;

    // then
    expect(signupOutput).toHaveProperty("accountId");
    const getAccount = new GetAccount(accountRepository);
    const account = (await getAccount.execute(
      signupOutput.accountId
    )) as GetAccountOutput;
    expect(account).not.toBeNull();
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.isPassenger).toBe(signupInput.isPassenger);
  });

  it("should create account for driver", async () => {
    // given
    const signupInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .withIsPassenger(false)
      .build();
    const { signup, accountRepository } = createSubject();

    // when
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;

    // then
    expect(signupOutput).toHaveProperty("accountId");
    const getAccount = new GetAccount(accountRepository);
    const account = (await getAccount.execute(
      signupOutput.accountId
    )) as GetAccountOutput;
    expect(account).not.toBeNull();
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.isPassenger).toBe(signupInput.isPassenger);
    expect(account.isDriver).toBe(signupInput.isDriver);
    expect(account.carPlate).toBe(signupInput.carPlate);
  });

  it("should return Error when email is already related to an account", async () => {
    // given
    const { signupInput } = createFixture();
    const { signup } = createSubject();

    await signup.execute(signupInput);
    const inputWithSameEmail = new SignUpInputBuilder()
      .withEmail(signupInput.email)
      .build();

    // when
    const signupOutput = await signup.execute(inputWithSameEmail);

    // then
    expect(signupOutput).toEqual([
      new Error("Account with this email already exists"),
    ]);
  });

  it("should return Error when name is invalid", async () => {
    // given
    const invalidName = faker.number.int().toString();
    const signupInput = new SignUpInputBuilder().withName(invalidName).build();
    const { signup } = createSubject();

    // when
    const signupOutput = await signup.execute(signupInput);

    // then
    expect(signupOutput).toEqual([new Error("Invalid name")]);
  });

  it("should return Error when email is invalid", async () => {
    // given
    const invalidEmail = faker.lorem.words();
    const signupInput = new SignUpInputBuilder()
      .withEmail(invalidEmail)
      .build();
    const { signup } = createSubject();

    // when
    const signupOutput = await signup.execute(signupInput);

    // then
    expect(signupOutput).toEqual([new Error("Invalid email")]);
  });

  it.each([
    "",
    faker.number.bigInt().toString(),
    null as unknown as string,
    undefined as unknown as string,
    "1111",
    "111111111",
    "11111111111",
  ])("should return Error when cpf is invalid", async (invalidCpf) => {
    // given
    const signupInput = new SignUpInputBuilder().withCpf(invalidCpf).build();
    const { signup } = createSubject();

    // when
    const signupOutput = await signup.execute(signupInput);

    // then
    expect(signupOutput).toEqual([new Error("Invalid CPF")]);
  });

  it("should return Error when carPlate is invalid and account is driver", async () => {
    // given
    const invalidCarPlate = faker.lorem.words();
    const signupInput = new SignUpInputBuilder()
      .withCarPlate(invalidCarPlate)
      .withIsDriver(true)
      .build();
    const { signup } = createSubject();

    // when
    const signupOutput = await signup.execute(signupInput);

    // then
    expect(signupOutput).toEqual([new Error("Invalid car plate")]);
  });

  it("should return all Errors when all data are invalid", async () => {
    // given
    const invalidName = faker.number.int().toString();
    const invalidCpf = faker.number.bigInt().toString();
    const invalidEmail = faker.lorem.words();
    const invalidCarPlate = faker.lorem.word();

    const signupInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .withName(invalidName)
      .withCpf(invalidCpf)
      .withEmail(invalidEmail)
      .withCarPlate(invalidCarPlate)
      .build();
    const { signup } = createSubject();

    // when
    const signupOutput = await signup.execute(signupInput);

    // then
    expect(signupOutput).toEqual([
      new Error("Invalid CPF"),
      new Error("Invalid name"),
      new Error("Invalid email"),
      new Error("Invalid car plate"),
    ]);
  });
});
