import crypto from "crypto";
import { SignupOutput } from "./dtos/signup-output";
import { isValidCpf } from "./cpf-validation";
import { SqlAccountDAO } from "./DAO/account-dao";

const accountDAO = new SqlAccountDAO();

export async function signup(input: any): Promise<SignupOutput | Error> {
  const id = crypto.randomUUID();
  const existingAccount = await accountDAO.getByEmail(input.email);
  if (existingAccount)
    return new Error("Account with this email already exists");
  if (!isValidName(input.name)) return new Error("Invalid name");
  if (!isValidEmail(input.email)) return new Error("Invalid email");
  if (!isValidCpf(input.cpf)) return new Error("Invalid CPF");
  if (input.isDriver && !isValidCarPlate(input.carPlate))
    return new Error("Invalid car plate");
  await accountDAO.save({ ...input, id });

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
