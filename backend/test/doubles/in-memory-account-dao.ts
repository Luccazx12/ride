import { AccountDAO } from "../../src/DAO/account-dao";

export class InMemoryAccountDAO implements AccountDAO {
  private accounts: any[] = [];

  public async getByEmail(email: string): Promise<any> {
    return this.accounts.find((account: any) => account.email === email);
  }
  public async getById(id: string): Promise<any> {
    return this.accounts.find((account: any) => account.accountId === id);
  }
  public async save(account: any): Promise<void> {
    this.accounts.push(account);
  }
}
