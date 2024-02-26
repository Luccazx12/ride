import pgp from "pg-promise";

export async function getAccountById(id: string): Promise<any> {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  const [acc] = await connection.query(
    "select * from ride.account where account_id = $1",
    [id]
  );
  await connection.$pool.end();
  return acc;
}

export async function getAccountByEmail(email: string): Promise<any> {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  const [acc] = await connection.query(
    "select * from ride.account where email = $1",
    [email]
  );
  await connection.$pool.end();
  return acc;
}
