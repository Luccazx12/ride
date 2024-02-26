import { faker } from "@faker-js/faker";
import { Ride, RideStatus } from "../../src/dtos/ride";

export class RideBuilder {
  private props: Ride = {
    rideId: faker.string.uuid(),
    fare: 0,
    distance: 0,
    from: {
      lat: faker.location.latitude(),
      long: faker.location.longitude(),
    },
    to: {
      lat: faker.location.latitude(),
      long: faker.location.longitude(),
    },
    status: RideStatus.requested,
    passengerId: faker.string.uuid(),
    requestedAt: new Date(),
  };

  public withPassengerId(passengerId: string): this {
    this.props.passengerId = passengerId;
    return this;
  }

  public build(): Ride {
    return this.props;
  }
}
