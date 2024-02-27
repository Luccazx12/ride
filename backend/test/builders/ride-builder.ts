import { faker } from "@faker-js/faker";
import { Ride, RideStatus, RideProperties } from "../../src/ride";

export class RideBuilder {
  private props: RideProperties = {
    rideId: faker.string.uuid(),
    fare: 0,
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

  public withStatus(status: RideStatus): this {
    this.props.status = status;
    return this;
  }

  public withPassengerId(passengerId: string): this {
    this.props.passengerId = passengerId;
    return this;
  }

  public build(): Ride {
    return Ride.restore(this.props);
  }
}
