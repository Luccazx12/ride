import { faker } from "@faker-js/faker";
import { SignupOutput } from "../src/dtos/signup-output";
import { getAccountById } from "../src/get-account";
import { signup } from "../src/signup";
import { SignUpInputBuilder } from "./builders/signup-input-builder";

describe("GetAccountById", () => {
  it("should return account when account is found", async () => {
    // given
    const signupInput = new SignUpInputBuilder().build();
    const signupOutput = (await signup(signupInput)) as SignupOutput;

    // when
    const account = await getAccountById(signupOutput.accountId);

    // then
    expect(account.name).toBe(signupInput.name);
    expect(account.email).toBe(signupInput.email);
    expect(account.cpf).toBe(signupInput.cpf);
    expect(account.is_passenger).toBe(signupInput.isPassenger);
    expect(account.car_plate).toBe(signupInput.carPlate);
    expect(account.is_driver).toBe(signupInput.isPassenger);
  });

  it("should return null when account is not found", async () => {
    // given
    const accountId = faker.string.uuid()

    // when
    const account = await getAccountById(accountId);

    // then
    expect(account).not.toBeNull();
  });
});
