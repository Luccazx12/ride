import { faker } from "@faker-js/faker";
import { Position } from "../../src/domain/entity/position";

export class PositionBuilder {
  private readonly props = {
    rideId: faker.string.uuid(),
    coordinates: {
      lat: faker.location.latitude(),
      long: faker.location.longitude(),
    },
    date: new Date(),
    positionId: faker.string.uuid(),
  };

  public build(): Position {
    return Position.restore(this.props);
  }
}
