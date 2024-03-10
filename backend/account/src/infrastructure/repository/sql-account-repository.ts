import { AccountRepository } from "../../application/repository/account-repository";
import { Account } from "../../domain/entity/account";
import { ORM } from "../orm/orm";
import { ORMRepository } from "../orm/orm-repository";
import { AccountModel } from "./account-model";

export class SqlAccountRepository
  extends ORMRepository<Account, AccountModel>
  implements AccountRepository
{
  public constructor(protected readonly orm: ORM<AccountModel>) {
    super(orm, AccountModel);
  }

  public async getByEmail(email: string): Promise<Account | null> {
    return this.findBy(AccountModel, "email", email);
  }

  public async getById(id: string): Promise<Account | null> {
    return this.findBy(AccountModel, "accountId", id);
  }
}
