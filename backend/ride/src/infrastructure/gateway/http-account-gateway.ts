import axios from "axios";
import { AccountGateway } from "../../application/gateway/account-gateway";
import { GetAccountOutput } from "../../dtos/get-account-output";
import { SignupInput } from "../../dtos/signup-input";
import { SignupOutput } from "../../dtos/signup-output";

axios.defaults.validateStatus = (status: number) => {
  return status < 500;
};

export class HttpAccountGateway implements AccountGateway {
  public async signup(input: SignupInput): Promise<SignupOutput> {
    const response = await axios.post("http://localhost:3001/v1/signup", input);
    return response.data;
  }

  public async getById(id: string): Promise<GetAccountOutput> {
    const response = await axios.get(`http://localhost:3001/v1/accounts/${id}`);
    return response.data;
  }
}
