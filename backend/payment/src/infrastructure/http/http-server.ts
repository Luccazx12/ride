import express from "express";

export enum HttpMethod {
  get = "get",
  post = "post",
  put = "put",
  patch = "patch",
}

export type HttpResponse = {
  status: number;
  data?: unknown;
};

export type HttpRequest = {
  body?: any;
  query?: any;
  params?: any;
  headers?: any;
};

type HttpFunction = (request: HttpRequest) => Promise<HttpResponse>;

export interface HttpServer {
  listen(port: number): void;
  register(method: HttpMethod, url: string, callback: HttpFunction): void;
}

export class ExpressAdapter implements HttpServer {
  private readonly app: express.Express;

  public constructor() {
    this.app = express();
    this.app.use(express.json());
  }

  public listen(port: number): void {
    this.app.listen(port);
  }

  public register(
    method: HttpMethod,
    url: string,
    callback: HttpFunction
  ): void {
    this.app[method](url, async function (req, res) {
      try {
        const callbackOutput = await callback({
          body: req.body,
          params: req.params,
          query: req.query,
          headers: req.headers,
        });
        res.status(callbackOutput.status).json(callbackOutput.data);
      } catch (error: unknown) {
        console.log("err", error);
        res.status(500).json({
          code: "internal_server_error",
          message: "Internal server error",
        });
      }
    });
  }
}
