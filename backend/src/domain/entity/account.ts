import crypto from "crypto";
import { isValidCpf } from "../cpf-validation";

export type AccountProperties = {
  accountId: string;
  name: string;
  email: string;
  cpf: string;
  carPlate: string;
  isPassenger: boolean;
  isDriver: boolean;
};

export class Account {
  private validationErrors: Error[] = [];

  private constructor(private readonly properties: AccountProperties) {
    this.validate();
  }

  public static create(
    properties: Omit<AccountProperties, "accountId">
  ): Account {
    const id = crypto.randomUUID();
    return new Account({ ...properties, accountId: id });
  }

  public static restore(properties: AccountProperties): Account {
    return new Account(properties);
  }

  public get accountId(): string {
    return this.properties.accountId;
  }

  public get email(): string {
    return this.properties.email;
  }

  public get name(): string {
    return this.properties.name;
  }

  public get isDriver(): boolean {
    return this.properties.isDriver;
  }

  public get isPassenger(): boolean {
    return this.properties.isPassenger;
  }

  public getProperties(): AccountProperties {
    return Object.freeze(this.properties);
  }

  public getErrors(): Error[] {
    return this.validationErrors;
  }

  private validate(): void {
    const properties = this.properties;
    if (!isValidCpf(properties.cpf))
      this.validationErrors.push(new Error("Invalid CPF"));
    if (!this.isValidName(properties.name))
      this.validationErrors.push(new Error("Invalid name"));
    if (!this.isValidEmail(properties.email))
      this.validationErrors.push(new Error("Invalid email"));
    if (properties.isDriver && !this.isValidCarPlate(properties.carPlate))
      this.validationErrors.push(new Error("Invalid car plate"));
  }

  private isValidName(name: string): boolean {
    return RegExp(/[a-zA-Z] [a-zA-Z]+/).test(name);
  }

  private isValidEmail(email: string): boolean {
    return RegExp(/^(.+)@(.+)$/).test(email);
  }

  private isValidCarPlate(carPlate: string): boolean {
    return RegExp(/[A-Z]{3}\d{4}/).test(carPlate);
  }
}
