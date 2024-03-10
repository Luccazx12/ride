import { HttpMethod, HttpRequest, HttpServer } from "./http-server";
import { Inject } from "../dependency-injection/container";
import { HttpServerDIToken } from "../dependency-injection/di-tokens";

export class MainController {
  @Inject(HttpServerDIToken)
  private httpServer!: HttpServer;

  public registerHttpRoutes() {
    //
  }
}
