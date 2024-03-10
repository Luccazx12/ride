import assert from "assert";

export class HttpClientResponse {
  private static readonly BAD_REQUEST = 400;

  private static readonly INTERNAL_SERVER_ERROR = 500;

  public constructor(
    public readonly statusCode: number,
    private readonly data: unknown,
    private readonly headers?: unknown,
    private readonly url?: string
  ) {}

  public hasStatus(status: number): boolean {
    return this.statusCode === status;
  }

  public hasStatusOrThrow(status: number | number[]): void {
    let hasStatus: boolean;

    if (Array.isArray(status)) {
      hasStatus = status.includes(this.statusCode);
    } else {
      hasStatus = this.statusCode === status;
    }

    if (!hasStatus) {
      throw new Error(
        `Request to ${this.url} failed with status code ${this.statusCode}`
      );
    }
  }

  public isClientError(): boolean {
    return (
      this.statusCode >= HttpClientResponse.BAD_REQUEST &&
      this.statusCode < HttpClientResponse.INTERNAL_SERVER_ERROR
    );
  }

  public async getData<T extends {}>(): Promise<T> {
    return this.data as T;
  }

  public async getArrayData<T extends {}>(): Promise<T[]> {
    assert(
      Array.isArray(this.data),
      "Expected the data content to be an array"
    );
    return this.data;
  }

  public async getRawData(): Promise<unknown> {
    return this.data;
  }

  public getHeader(key: string): string | null {
    const header: unknown = (this.headers as any)[key.toLowerCase()];
    if (typeof header !== "string") return null;
    return header;
  }
}
