import { faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";
import { SignupInput } from "../../src/dtos/signup-input";

export class SignUpInputBuilder {
  private props = {
    name: faker.person.fullName(),
    cpf: cpf.generate(false),
    email: faker.internet.email(),
    password: faker.internet.password(),
    carPlate: `${faker.lorem.word({ length: 3 }).toUpperCase()}${faker.number.int({
      min: 1000,
      max: 9999,
    })}`,
    isPassenger: false,
    isDriver: false,
  };

  public withIsPassenger(isPassenger: boolean): this {
    this.props.isPassenger = isPassenger;
    return this;
  }

  public withIsDriver(isDriver: boolean): this {
    this.props.isDriver = isDriver;
    return this;
  }

  public withCarPlate(carPlate: string): this {
    this.props.carPlate = carPlate;
    return this;
  }

  public withCpf(cpf: string): this {
    this.props.cpf = cpf;
    return this;
  }

  public withName(name: string): this {
    this.props.name = name;
    return this;
  }

  public withEmail(email: string): this {
    this.props.email = email;
    return this;
  }

  public build(): SignupInput {
    return this.props;
  }
}
