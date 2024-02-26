import { SignupInput } from "../src/dtos/signup-input";
import { SignUpInputBuilder } from "./builders/signup-input-builder";
import { faker } from "@faker-js/faker";
import { SignupOutput } from "../src/dtos/signup-output";
import { getAccount } from "../src/get-account";
import { Signup } from "../src/signup";
import { SqlAccountDAO } from "../src/DAO/account-dao";

interface Fixture {
  signupInput: SignupInput;
}

interface Subject {
  signup: Signup;
}

const createFixture = (): Fixture => {
  return {
    signupInput: new SignUpInputBuilder().build(),
  };
};

const createSubject = (): Subject => {
  const accountDAO = new SqlAccountDAO();
  return {
    signup: new Signup(accountDAO),
  };
};

describe("Signup", () => {
  it("should create account for passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder()
      .withIsDriver(false)
      .withIsPassenger(true)
      .build();
    const { signup } = createSubject();

    // when
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;

    // then
    expect(signupOutput).toHaveProperty("accountId");
    const account = await getAccount(signupOutput.accountId);
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.is_passenger).toBe(signupInput.isPassenger);
  });

  it("should create account for driver", async () => {
    // given
    const signupInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .withIsPassenger(false)
      .build();
    const { signup } = createSubject();

    // when
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;

    // then
    expect(signupOutput).toHaveProperty("accountId");
    const account = await getAccount(signupOutput.accountId);
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.is_passenger).toBe(signupInput.isPassenger);
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
    expect(signupOutput).toEqual(
      new Error("Account with this email already exists")
    );
  });

  it("should return Error when name is invalid", async () => {
    // given
    const invalidName = faker.number.int().toString();
    const signupInput = new SignUpInputBuilder().withName(invalidName).build();
    const { signup } = createSubject();

    // when
    const signupOutput = await signup.execute(signupInput);

    // then
    expect(signupOutput).toEqual(new Error("Invalid name"));
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
    expect(signupOutput).toEqual(new Error("Invalid email"));
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
    expect(signupOutput).toEqual(new Error("Invalid CPF"));
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
    expect(signupOutput).toEqual(new Error("Invalid car plate"));
  });
});
