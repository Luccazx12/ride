import { AccountDAO } from "./DAO/account-dao";
import { Account } from "./dtos/account";

export class GetAccount {
  public constructor(private readonly accountDAO: AccountDAO) {}

  public async execute(id: string): Promise<Account | null> {
    return this.accountDAO.getById(id);
  }
}
