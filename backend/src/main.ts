import crypto from "crypto";
import pgp from "pg-promise";
import { SignupOutput } from "./dtos/signup-output";

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

export function isValidCpf(cpf: string): boolean {
  if (!cpf) return false;
  cpf = cleanCpf(cpf);
  if (!isCpfLengthValid(cpf)) return false;
  if (hasAllEqualsDigits(cpf)) return false;
  const firstDigit = calculateDigit(cpf, 10);
  const secondDigit = calculateDigit(cpf, 11);
  return extractVerificationDigit(cpf) === `${firstDigit}${secondDigit}`;
}

function cleanCpf(cpf: string): string {
  return cpf.replace(/\D/g, "");
}

function isCpfLengthValid(cpf: string): boolean {
  return cpf.length === 11;
}

function hasAllEqualsDigits(value: string): boolean {
  return value.split("").every((v) => v === value[0]);
}

function calculateDigit(cpf: string, factor: number): string {
  let total = 0;
  for (const digit of cpf) {
    if (factor > 1) total += parseInt(digit) * factor--;
  }
  const rest = total % 11;
  return String(rest < 2 ? 0 : 11 - rest);
}

function extractVerificationDigit(cpf: string): string {
  return cpf.slice(9);
}

function isValidCarPlate(carPlate: string): boolean {
  return RegExp(/[A-Z]{3}\d{4}/).test(carPlate);
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
