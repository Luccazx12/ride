import { GetAccount } from "../../application/usecase/get-account";
import { HttpMethod, HttpRequest, HttpServer } from "./http-server";
import { Signup } from "../../application/usecase/signup";
import { Inject } from "../dependency-injection/container";
import {
  GetAccountDIToken,
  HttpServerDIToken,
  SignupDIToken,
} from "../dependency-injection/di-tokens";

export class MainController {
  @Inject(HttpServerDIToken)
  private httpServer!: HttpServer;

  @Inject(SignupDIToken)
  private signup!: Signup;

  @Inject(GetAccountDIToken)
  private getAccount!: GetAccount;

  public registerHttpRoutes() {
    this.httpServer.register(
      HttpMethod.post,
      "/v1/signup",
      async (req: HttpRequest) => {
        const signupOutput = await this.signup.execute(req.body);
        if (Array.isArray(signupOutput) && signupOutput[0] instanceof Error) {
          return {
            status: 422,
            data: signupOutput.map((e) => ({
              message: e.message,
            })),
          };
        }
        return { status: 200, data: signupOutput };
      }
    );

    this.httpServer.register(
      HttpMethod.get,
      "/v1/accounts/:id",
      async (req: HttpRequest) => {
        const account = await this.getAccount.execute(req.params.id);
        if (!account) return { status: 404 };
        return { status: 200, data: account };
      }
    );
  }
}
