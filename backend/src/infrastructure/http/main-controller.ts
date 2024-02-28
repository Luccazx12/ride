import { GetAccount } from "../../application/usecase/get-account";
import { GetRide } from "../../application/usecase/get-ride";
import { HttpMethod, HttpRequest, HttpServer } from "./http-server";
import { RequestRide } from "../../application/usecase/request-ride";
import { Signup } from "../../application/usecase/signup";

export class MainController {
  public constructor(
    private readonly httpServer: HttpServer,
    private readonly signup: Signup,
    private readonly getAccount: GetAccount,
    private readonly requestRide: RequestRide,
    private readonly getRide: GetRide
  ) {}

  public registerHttpRoutes() {
    this.httpServer.register(
      HttpMethod.post,
      "/v1/signup",
      async (req: HttpRequest) => {
        const signupOutput = await this.signup.execute(req.body);
        if (Array.isArray(signupOutput) && signupOutput[0] instanceof Error) {
          return {
            data: signupOutput.map((e) => ({
              message: e.message,
            })),
            status: 422,
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
        if (requestRideOutput instanceof Error) {
          return { status: 422, data: requestRideOutput.message };
        }
        return { status: 200, data: requestRideOutput };
      }
    );
  }
}
