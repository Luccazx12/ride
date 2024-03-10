import { faker } from "@faker-js/faker";
import { Coordinates } from "../../src/dtos/ride";
import { UpdatePositionInput } from "../../src/dtos/update-position-input";

export class UpdatePositionInputBuilder {
  private readonly props = {
    rideId: faker.string.uuid(),
    position: {
      lat: faker.location.latitude(),
      long: faker.location.longitude(),
    },
  };

  public withRideId(rideId: string): this {
    this.props.rideId = rideId;
    return this;
  }

  public withCoordinates(coordinates: Coordinates): this {
    this.props.position = coordinates;
    return this;
  }

  public build(): UpdatePositionInput {
    return this.props;
  }
}
