import { getAccountById, signup } from "../src/main";
import { SignupInput } from "../src/dtos/signup-input";
import { SignUpInputBuilder } from "./builders/signup-input-builder";
import { faker } from "@faker-js/faker";

interface Fixture {
  signupInput: SignupInput;
}

const createFixture = (): Fixture => {
  return {
    signupInput: new SignUpInputBuilder().build(),
  };
};

describe("Main", () => {
  it("should create account for passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder()
      .withIsDriver(false)
      .withIsPassenger(true)
      .build();

    // when
    const signupOutput = await signup(signupInput);

    // then
    const account = await getAccountById(signupOutput.accountId);
    expect(signupOutput.accountId).toBeDefined();
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.is_passenger).toBe(signupInput.isPassenger);
  });

  it.only("should create account for driver", async () => {
    // given
    const signupInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .withIsPassenger(false)
      .build();

    // when
    const signupOutput = await signup(signupInput);
    console.log(signupOutput);

    // then
    const account = await getAccountById(signupOutput.accountId);
    expect(signupOutput.accountId).toBeDefined();
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.is_passenger).toBe(signupInput.isPassenger);
  });

  it("should return -4 when email is already related to an account", async () => {
    // given
    const { signupInput } = createFixture();
    await signup(signupInput);
    const inputWithSameEmail = new SignUpInputBuilder()
      .withEmail(signupInput.email)
      .build();

    // when
    const signupOutput = await signup(inputWithSameEmail);

    // then
    const account = await getAccountById(signupOutput.accountId);
    expect(signupOutput).toBe(-4);
    expect(account).not.toBeDefined();
  });

  it("should return -3 when name is invalid", async () => {
    // given
    const invalidName = faker.number.int().toString();
    const signupInput = new SignUpInputBuilder().withName(invalidName).build();

    // when
    const signupOutput = await signup(signupInput);

    // then
    const account = await getAccountById(signupOutput.accountId);
    expect(account).not.toBeDefined();
    expect(signupOutput).toBe(-3);
  });

  it("should return -2 when email is invalid", async () => {
    // given
    const invalidEmail = faker.lorem.words();
    const signupInput = new SignUpInputBuilder()
      .withEmail(invalidEmail)
      .build();

    // when
    const signupOutput = await signup(signupInput);

    // then
    const account = await getAccountById(signupOutput.accountId);
    expect(signupOutput).toBe(-2);
    expect(account).not.toBeDefined();
  });

  it("should return -1 when cpf is invalid", async () => {
    // given
    const invalidCpf = faker.number.bigInt().toString();
    const signupInput = new SignUpInputBuilder().withCpf(invalidCpf).build();

    // when
    const signupOutput = await signup(signupInput);

    // then
    const account = await getAccountById(signupOutput.accountId);
    expect(signupOutput).toBe(-1);
    expect(account).not.toBeDefined();
  });

  it("should return -5 when carPlate is invalid and account is driver", async () => {
    // given
    const invalidCarPlate = faker.lorem.words();
    const signupInput = new SignUpInputBuilder()
      .withCarPlate(invalidCarPlate)
      .withIsDriver(true)
      .build();

    // when
    const signupOutput = await signup(signupInput);

    // then
    const account = await getAccountById(signupOutput.accountId);
    expect(signupOutput).toBe(-5);
    expect(account).not.toBeDefined();
  });
});
