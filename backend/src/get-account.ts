import { AccountDAO } from "./DAO/account-dao";

export class GetAccount {
  public constructor(private readonly accountDAO: AccountDAO) {}

  public async execute(id: string): Promise<any> {
    return this.accountDAO.getById(id);
  }
}
