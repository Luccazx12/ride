import pgp from "pg-promise";

export interface AccountDAO {
  getByEmail(email: string): Promise<any>;
  getById(id: string): Promise<any>;
  save(account: any): Promise<void>;
}

export class SqlAccountDAO implements AccountDAO {
  public async getByEmail(email: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query(
      "select * from ride.account where email = $1",
      [email]
    );
    await connection.$pool.end();
    return account;
  }

  public async getById(id: string) {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [account] = await connection.query(
      "select * from ride.account where account_id = $1",
      [id]
    );
    await connection.$pool.end();
    return account;
  }

  public async save(account: any): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "insert into ride.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)",
      [
        account.id,
        account.name,
        account.email,
        account.cpf,
        account.carPlate,
        !!account.isPassenger,
        !!account.isDriver,
      ]
    );
    await connection.$pool.end();
  }
}
