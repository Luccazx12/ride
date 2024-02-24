import crypto from "crypto";
import pgp from "pg-promise";

export function validateCpf(cpf: string) {
  if (!cpf) return false;
  cpf = cpf.replace(/\D/, "");
  if (cpf.length !== 11) return false;
  if (cpf.split("").every((c) => c === cpf[0])) return false;

  let d1, d2;
  let dg1, dg2, rest;
  let digito;
  let nDigResult;
  d1 = d2 = 0;
  dg1 = dg2 = rest = 0;

  for (let nCount = 1; nCount < cpf.length - 1; nCount++) {
    digito = parseInt(cpf.substring(nCount - 1, nCount));
    d1 = d1 + (11 - nCount) * digito;

    d2 = d2 + (12 - nCount) * digito;
  }

  rest = d1 % 11;

  dg1 = rest < 2 ? (dg1 = 0) : 11 - rest;
  d2 += 2 * dg1;
  rest = d2 % 11;
  rest < 2 ? (dg2 = 0) : (dg2 = 11 - rest);
  let nDigVerific = cpf.substring(cpf.length - 2, cpf.length);
  nDigResult = "" + dg1 + "" + dg2;
  return nDigVerific == nDigResult;
}

export async function signup(input: any): Promise<any> {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  try {
    const id = crypto.randomUUID();

    const [acc] = await connection.query(
      "select * from ride.account where email = $1",
      [input.email]
    );
    if (!acc) {
      if (input.name.match(/[a-zA-Z] [a-zA-Z]+/)) {
        if (input.email.match(/^(.+)@(.+)$/)) {
          if (validateCpf(input.cpf)) {
            if (input.isDriver) {
              if (input.carPlate.match(/[A-Z]{3}[0-9]{4}/)) {
                await connection.query(
                  "insert into ride.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)",
                  [
                    id,
                    input.name,
                    input.email,
                    input.cpf,
                    input.carPlate,
                    !!input.isPassenger,
                    !!input.isDriver,
                  ]
                );

                const obj = {
                  accountId: id,
                };
                return obj;
              } else {
                // invalid car plate
                return -5;
              }
            } else {
              await connection.query(
                "insert into ride.account (account_id, name, email, cpf, car_plate, is_passenger, is_driver) values ($1, $2, $3, $4, $5, $6, $7)",
                [
                  id,
                  input.name,
                  input.email,
                  input.cpf,
                  input.carPlate,
                  !!input.isPassenger,
                  !!input.isDriver,
                ]
              );

              const obj = {
                accountId: id,
              };
              return obj;
            }
          } else {
            // invalid cpf
            return -1;
          }
        } else {
          // invalid email
          return -2;
        }
      } else {
        // invalid name
        return -3;
      }
    } else {
      // already exists
      return -4;
    }
  } finally {
    await connection.$pool.end();
  }
}

export async function getAccountById(id: string): Promise<any> {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  const [acc] = await connection.query(
    "select * from ride.account where account_id = $1",
    [id]
  );
  await connection.$pool.end();
  return acc;
}
