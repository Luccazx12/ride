import { faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";
import { SignupInput } from "../../src/dtos/signup-input";

export class SignUpInputBuilder {
  private props = {
    name: faker.person.fullName(),
    cpf: cpf.generate(false),
    email: faker.internet.email(),
    isPassenger: true,
    password: faker.internet.password(),
  };

  public withEmail(email: string): this {
    this.props.email = email;
    return this;
  }

  public build(): SignupInput {
    return this.props;
  }
}
