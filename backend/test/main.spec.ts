import { getAccountById, signup } from "../src/main";
import { SignupInput } from "../src/dtos/signup-input";
import { SignUpInputBuilder } from "./builders/signup-input-builder";

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
    const { signupInput } = createFixture();

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
});
