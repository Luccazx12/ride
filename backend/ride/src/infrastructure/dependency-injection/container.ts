import assert from "assert";

export type Newable<T> = new (...args: any[]) => T;
export interface Abstract<T> {
  prototype: T;
}
export type ServiceIdentifier<T = unknown> =
  | Newable<T>
  | Abstract<T>
  | string
  | symbol;

export interface ContainerStorage {
  register<T>(serviceIdentifier: ServiceIdentifier<T>, dependency: T): void;
  get<T>(type: ServiceIdentifier<T>): T | null;
  getAsync<T>(type: ServiceIdentifier<T>): Promise<T | null>;
}

export class Container {
  private static instance: Container | undefined;

  private constructor(private storage: ContainerStorage) {}

  public static getInstance(storage?: ContainerStorage): Container {
    if (!Container.instance) {
      assert(storage);
      Container.instance = new Container(storage);
    }

    return Container.instance;
  }

  public get<T>(identifier: ServiceIdentifier<T>): T | null {
    return this.storage.get(identifier);
  }

  public async getAsync<T>(
    identifier: ServiceIdentifier<T>
  ): Promise<T | null> {
    return this.storage.getAsync(identifier);
  }

  public register<T>(identifier: ServiceIdentifier<T>, dependency: T): void {
    if (this.storage.get(identifier) !== null) {
      throw new Error("Dependency already registered");
    }

    this.storage.register(identifier, dependency);
  }
}

export function Inject<T extends { [key: string]: any }>(
  identifier: ServiceIdentifier<T>
) {
  return function (target: any, propertyKey: string) {
    target[propertyKey] = new Proxy(
      {},
      {
        get(_target: any, propertyKey: string) {
          const dependency = Container.getInstance().get(identifier);
          if (!dependency)
            throw new Error(
              `Dependency for ${identifier.toString()} not found`
            );
          return dependency[propertyKey];
        },
      }
    );
  };
}
