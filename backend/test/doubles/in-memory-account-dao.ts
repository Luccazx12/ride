import { AccountDAO } from "../../src/DAO/account-dao";
import { Account } from "../../src/dtos/account";

export class InMemoryAccountDAO implements AccountDAO {
  private accounts: any[] = [];

  public async getByEmail(email: string): Promise<Account | null> {
    const account = this.accounts.find(
      (account: any) => account.email === email
    );
    if (!account) return null;
    return account;
  }
  public async getById(id: string): Promise<Account | null> {
    const account = this.accounts.find(
      (account: any) => account.accountId === id
    );
    if (!account) return null;
    return account;
  }
  public async save(account: Account): Promise<void> {
    this.accounts.push(account);
  }
}
