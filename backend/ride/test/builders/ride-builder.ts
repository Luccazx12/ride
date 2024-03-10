import { faker } from "@faker-js/faker";
import { Ride, RideProperties } from "../../src/domain/entity/ride";

export class RideBuilder {
  private readonly from = {
    lat: faker.location.latitude(),
    long: faker.location.longitude(),
  };

  private props: RideProperties = {
    rideId: faker.string.uuid(),
    fare: 0,
    from: this.from,
    to: {
      lat: faker.location.latitude(),
      long: faker.location.longitude(),
    },
    passengerId: faker.string.uuid(),
    requestedAt: new Date(),
    distance: 0,
    lastPosition: this.from,
  };

  public withDriverId(driverId?: string): this {
    this.props.driverId = driverId;
    return this;
  }

  public withId(rideId: string): this {
    this.props.rideId = rideId;
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
