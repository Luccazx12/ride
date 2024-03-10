import { GetAccount } from "../../application/usecase/get-account";
import { GetRide } from "../../application/usecase/get-ride";
import { HttpMethod, HttpRequest, HttpServer } from "./http-server";
import { RequestRide } from "../../application/usecase/request-ride";
import { Signup } from "../../application/usecase/signup";
import { Inject } from "../dependency-injection/container";
import {
  GetAccountDIToken,
  HttpServerDIToken,
  SignupDIToken,
  RequestRideDIToken,
  GetRideDIToken,
} from "../dependency-injection/di-tokens";

export class MainController {
  @Inject(HttpServerDIToken)
  private httpServer!: HttpServer;

  @Inject(SignupDIToken)
  private signup!: Signup;

  @Inject(GetAccountDIToken)
  private getAccount!: GetAccount;

  @Inject(RequestRideDIToken)
  private requestRide!: RequestRide;

  @Inject(GetRideDIToken)
  private getRide!: GetRide;

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

    this.httpServer.register(
      HttpMethod.get,
      "/v1/ride/:id",
      async (req: HttpRequest) => {
        const ride = await this.getRide.execute(req.params.id);
        if (!ride) return { status: 404 };
        return { status: 200, data: ride };
      }
    );

    this.httpServer.register(
      HttpMethod.post,
      "/v1/request_ride",
      async (req: HttpRequest) => {
        const requestRideOutput = await this.requestRide.execute(req.body);
        if (
          Array.isArray(requestRideOutput) &&
          requestRideOutput[0] instanceof Error
        ) {
          return {
            status: 422,
            data: requestRideOutput.map((e) => ({
              message: e.message,
            })),
          };
        }
        return { status: 200, data: requestRideOutput };
      }
    );
  }
}
