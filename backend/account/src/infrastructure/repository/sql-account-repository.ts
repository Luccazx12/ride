import { AccountRepository } from "../../application/repository/account-repository";
import { Account } from "../../domain/entity/account";
import { AccountModel } from "../orm/account-model";
import { ORM } from "../orm/orm";

export class SqlAccountRepository implements AccountRepository {
  public constructor(private readonly orm: ORM<AccountModel>) {}

  public async getByEmail(email: string): Promise<Account | null> {
    const account = await this.orm.findBy(AccountModel, "email", email);
    if (!account) return null;
    return account.toAggregate();
  }

  public async getById(id: string): Promise<Account | null> {
    const account = await this.orm.findBy(AccountModel, "accountId", id);
    if (!account) return null;
    return account.toAggregate();
  }

  public async save(account: Account): Promise<void> {
    await this.orm.save(AccountModel.fromAggregate(account));
  }
}
