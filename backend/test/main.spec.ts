import { faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";
import { signup } from "../src/main";

interface SignupInput {
  name: string;
  email: string;
  cpf: string;
  isPassenger: boolean;
  password: string;
}

interface Fixture {
  signupInput: SignupInput;
}

const createFixture = (): Fixture => {
  return {
    signupInput: {
      name: faker.person.fullName(),
      cpf: cpf.generate(false),
      email: faker.internet.email(),
      isPassenger: true,
      password: faker.internet.password(),
    },
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
  });
});
