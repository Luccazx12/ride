import { faker } from "@faker-js/faker";
import { AcceptRideInput } from "../../src/dtos/accept-ride-input";

export class AcceptRideInputBuilder {
  private readonly props = {
    rideId: faker.string.uuid(),
    driverId: faker.string.uuid(),
  };

  public withRideId(rideId: string): this {
    this.props.rideId = rideId;
    return this;
  }

  public withDriverId(driverId: string): this {
    this.props.driverId = driverId;
    return this;
  }

  public build(): AcceptRideInput {
    return this.props;
  }
}
