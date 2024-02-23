import { signup } from "../src/main";
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
    expect(signupOutput.accountId).toBeDefined();
    expect(signupOutput.name).toBe(signupInput.name);
    expect(signupOutput.email).toBe(signupInput.email);
    expect(signupOutput.cpf).toBe(signupInput.cpf);
    expect(signupOutput.isPassenger).toBe(signupInput.isPassenger);
  });
});
