import { faker } from "@faker-js/faker";
import { CoordinatesBuilder } from "./coordinates-builder";
import { RequestRideInput } from "../../src/dtos/request-ride-input";

export class RequestRideInputBuilder {
  private readonly props = {
    passengerId: faker.string.uuid(),
    from: new CoordinatesBuilder().build(),
    to: new CoordinatesBuilder().build(),
  };

  public withPassengerId(passengerId: string): this {
    this.props.passengerId = passengerId;
    return this;
  }

  public build(): RequestRideInput {
    return this.props;
  }
}
