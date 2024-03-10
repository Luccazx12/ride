import { ContainerStorage, ServiceIdentifier } from "./container";

export class InMemoryContainerStorage implements ContainerStorage {
  private readonly instances: Map<ServiceIdentifier, any> = new Map();

  public async getAsync<T>(
    serviceIdentifier: ServiceIdentifier<T>
  ): Promise<T | null> {
    return this.get(serviceIdentifier);
  }

  public get<T>(serviceIdentifier: ServiceIdentifier<T>): T | null {
    let instance = this.instances.get(serviceIdentifier);
    if (!instance) return null;
    return instance;
  }

  public register<T>(
    serviceIdentifier: ServiceIdentifier<T>,
    dependency: T
  ): void {
    this.instances.set(serviceIdentifier, dependency);
  }
}
