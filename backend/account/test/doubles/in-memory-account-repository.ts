import { AccountRepository } from "../../src/application/repository/account-repository";
import { Account } from "../../src/domain/entity/account";

export class InMemoryAccountRepository implements AccountRepository {
  private accounts: Account[] = [];

  public async getByEmail(email: string): Promise<Account | null> {
    const account = this.accounts.find((account) => account.email === email);
    if (!account) return null;
    return account;
  }

  public async getById(id: string): Promise<Account | null> {
    const account = this.accounts.find((account) => account.accountId === id);
    if (!account) return null;
    return account;
  }

  public async save(account: Account): Promise<void> {
    this.accounts.push(account);
  }
}
