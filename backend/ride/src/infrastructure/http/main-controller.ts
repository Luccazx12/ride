import { GetRide } from "../../application/usecase/get-ride";
import { HttpMethod, HttpRequest, HttpServer } from "./http-server";
import { RequestRide } from "../../application/usecase/request-ride";
import { Inject } from "../dependency-injection/container";
import {
  HttpServerDIToken,
  RequestRideDIToken,
  GetRideDIToken,
} from "../dependency-injection/di-tokens";

export class MainController {
  @Inject(HttpServerDIToken)
  private httpServer!: HttpServer;

  @Inject(RequestRideDIToken)
  private requestRide!: RequestRide;

  @Inject(GetRideDIToken)
  private getRide!: GetRide;

  public registerHttpRoutes() {
    this.httpServer.register(
      HttpMethod.get,
      "/v1/ride/:id",
      async (req: HttpRequest) => {
        console.log(req);
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
