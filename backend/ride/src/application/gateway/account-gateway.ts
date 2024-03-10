import { GetAccountOutput } from "../../dtos/get-account-output";
import { SignupInput } from "../../dtos/signup-input";
import { SignupOutput } from "../../dtos/signup-output";

export interface AccountGateway {
  getById(id: string): Promise<GetAccountOutput | null>;
  signup(input: SignupInput): Promise<SignupOutput>;
}
