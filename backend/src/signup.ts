import pgp from "pg-promise";
import { SignupOutput } from "./dtos/signup-output";
import { isValidCpf } from "./cpf-validation";
import crypto from "crypto";

export async function signup(input: any): Promise<SignupOutput | Error> {
  const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
  const id = crypto.randomUUID();

  const [acc] = await connection.query(
    "select * from ride.account where email = $1",
    [input.email]
  );
  if (acc) return new Error("Account with this email already exists");
  if (!isValidName(input.name)) return new Error("Invalid name");
  if (!isValidEmail(input.email)) return new Error("Invalid email");
  if (!isValidCpf(input.cpf)) return new Error("Invalid CPF");
  if (input.isDriver && !isValidCarPlate(input.carPlate))
    return new Error("Invalid car plate");
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

  await connection.$pool.end();
  return {
    accountId: id,
  };
}

function isValidName(name: string): boolean {
  return RegExp(/[a-zA-Z] [a-zA-Z]+/).test(name);
}

function isValidEmail(email: string): boolean {
  return RegExp(/^(.+)@(.+)$/).test(email);
}

function isValidCarPlate(carPlate: string): boolean {
  return RegExp(/[A-Z]{3}\d{4}/).test(carPlate);
}
