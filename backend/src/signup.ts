import { SignupOutput } from "./dtos/signup-output";
import { AccountDAO } from "./DAO/account-dao";
import { SignupInput } from "./dtos/signup-input";
import { MailerGateway } from "./mailer-gateway";
import { Account } from "./account";

export class Signup {
  public constructor(
    private readonly accountDAO: AccountDAO,
    private readonly mailerGateway: MailerGateway
  ) {}

  public async execute(input: SignupInput): Promise<SignupOutput | Error[]> {
    const existingAccount = await this.accountDAO.getByEmail(input.email);
    if (existingAccount)
      return [new Error("Account with this email already exists")];

    const account = Account.create(input);
    const errors = account.getErrors();
    if (errors.length > 0) return errors;
    await this.accountDAO.save(account);
    await this.mailerGateway.send(
      "Welcome",
      input.email,
      "Use this link to confirm your account"
    );
    return { accountId: account.accountId };
  }
}
