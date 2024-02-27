import { faker } from "@faker-js/faker";
import { cpf } from "cpf-cnpj-validator";
import { Account, AccountProperties } from "../../src/account";

export class AccountBuilder {
  private props: AccountProperties = {
    accountId: faker.string.uuid(),
    name: faker.person.fullName(),
    cpf: cpf.generate(false),
    email: faker.internet.email(),
    carPlate: `${faker.lorem
      .word({ length: 3 })
      .toUpperCase()}${faker.number.int({
      min: 1000,
      max: 9999,
    })}`,
    isPassenger: false,
    isDriver: false,
  };

  public build(): Account {
    return Account.restore(this.props);
  }
}
