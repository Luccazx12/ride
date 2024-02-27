import crypto from "crypto";
import { SignupOutput } from "./dtos/signup-output";
import { isValidCpf } from "./cpf-validation";
import { AccountDAO } from "./DAO/account-dao";
import { SignupInput } from "./dtos/signup-input";
import { MailerGateway } from "./mailer-gateway";

export class Signup {
  public constructor(
    private readonly accountDAO: AccountDAO,
    private readonly mailerGateway: MailerGateway
  ) {}

  public async execute(input: SignupInput): Promise<SignupOutput | Error> {
    const accountId = crypto.randomUUID();
    const existingAccount = await this.accountDAO.getByEmail(input.email);
    if (existingAccount)
      return new Error("Account with this email already exists");
    if (!this.isValidName(input.name)) return new Error("Invalid name");
    if (!this.isValidEmail(input.email)) return new Error("Invalid email");
    if (!isValidCpf(input.cpf)) return new Error("Invalid CPF");
    if (input.isDriver && !this.isValidCarPlate(input.carPlate))
      return new Error("Invalid car plate");
    await this.accountDAO.save({ ...input, accountId });
    await this.mailerGateway.send(
      "Welcome",
      input.email,
      "Use this link to confirm your account"
    );
    return { accountId };
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
