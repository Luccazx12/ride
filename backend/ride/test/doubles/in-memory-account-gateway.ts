import { AccountGateway } from "../../src/application/gateway/account-gateway";
import { SignupInput } from "../../src/dtos/signup-input";
import { SignupOutput } from "../../src/dtos/signup-output";
import { GetAccountOutput } from "../../src/dtos/get-account-output";
import crypto from "crypto";

export class InMemoryAccountGateway implements AccountGateway {
  private accounts: GetAccountOutput[] = [];

  public async getById(id: string): Promise<GetAccountOutput | null> {
    const account = this.accounts.find((account) => account.accountId === id);
    if (!account) return null;
    return account;
  }

  public async signup(input: SignupInput): Promise<SignupOutput> {
    const accountId = crypto.randomUUID();
    this.accounts.push({ ...input, accountId });
    return { accountId };
  }
}
