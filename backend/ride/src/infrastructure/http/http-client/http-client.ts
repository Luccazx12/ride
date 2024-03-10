import axios, { AxiosInstance } from "axios";
import { HttpMethod } from "../http-server";
import { HttpClientResponse } from "./http-client-response";

export interface HttpClientRequest<ReqData = unknown, ReqParams = unknown> {
  url: string;
  method: HttpMethod;
  params?: ReqParams;
  data?: ReqData;
  headers?: Record<string, string>;
}

export abstract class HttpClient {
  public constructor(protected baseUrl: string = "") {}
  abstract request(request: HttpClientRequest): Promise<HttpClientResponse>;
}

export class AxiosAdapter extends HttpClient {
  private static readonly INTERNAL_SERVER_ERROR = 500;

  private axios: AxiosInstance;

  public constructor(protected readonly baseUrl: string) {
    super(baseUrl);
    this.axios = axios.create({ baseURL: baseUrl });
    this.disableExceptionsByStatusCode();
  }

  public async request(
    request: HttpClientRequest<unknown, unknown>
  ): Promise<HttpClientResponse> {
    const axiosResponse = await this.axios.request(request);
    return new HttpClientResponse(
      axiosResponse.status,
      axiosResponse.data,
      axiosResponse.headers,
      request.url
    );
  }

  private disableExceptionsByStatusCode(): void {
    this.axios.defaults.validateStatus = (statusCode: number) => {
      return statusCode < AxiosAdapter.INTERNAL_SERVER_ERROR;
    };
  }
}
