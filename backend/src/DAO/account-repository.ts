import pgp from "pg-promise";
import { Account } from "../account";

export interface AccountRepository {
  getByEmail(email: string): Promise<Account | null>;
  getById(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
}

export class SqlAccountRepository implements AccountRepository {
  public async getByEmail(email: string): Promise<Account | null> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query(
      "select * from ride.account where email = $1",
      [email]
    );
    await connection.$pool.end();
    if (!account) return null;
    return this.mapToAccount(account);
  }

  public async getById(id: string): Promise<Account | null> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query(
      "select * from ride.account where account_id = $1",
      [id]
    );

    await connection.$pool.end();
    if (!account) return null;
    return this.mapToAccount(account);
  }

  public async save(account: Account): Promise<void> {
    const accountProperties = account.getProperties();
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ride.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)",
      [
        accountProperties.accountId,
        accountProperties.name,
        accountProperties.email,
        accountProperties.cpf,
        accountProperties.carPlate,
        !!accountProperties.isPassenger,
        !!accountProperties.isDriver,
      ]
    );
    await connection.$pool.end();
  }

  private mapToAccount(databaseAccount: any): Account {
    return Account.restore({
      accountId: databaseAccount.account_id,
      carPlate: databaseAccount.car_plate,
      isPassenger: databaseAccount.is_passenger,
      isDriver: databaseAccount.is_driver,
      cpf: databaseAccount.cpf,
      email: databaseAccount.email,
      name: databaseAccount.name,
    });
  }
}
