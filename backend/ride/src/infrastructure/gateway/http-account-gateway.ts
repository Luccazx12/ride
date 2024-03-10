import { AccountGateway } from "../../application/gateway/account-gateway";
import { GetAccountOutput } from "../../dtos/get-account-output";
import { SignupInput } from "../../dtos/signup-input";
import { SignupOutput } from "../../dtos/signup-output";
import { HttpClient } from "../http/http-client/http-client";
import { HttpMethod } from "../http/http-server";

export class HttpAccountGateway implements AccountGateway {
  public constructor(private readonly httpClient: HttpClient) {}

  public async signup(input: SignupInput): Promise<SignupOutput> {
    const httpResponse = await this.httpClient.request({
      method: HttpMethod.post,
      url: "/v1/signup",
      data: input,
    });
    return httpResponse.getData();
  }

  public async getById(id: string): Promise<GetAccountOutput | null> {
    const httpResponse = await this.httpClient.request({
      method: HttpMethod.get,
      url: `/v1/accounts/${id}`,
    });

    if (httpResponse.hasStatus(404)) return null;
    return httpResponse.getData<GetAccountOutput>();
  }
}
