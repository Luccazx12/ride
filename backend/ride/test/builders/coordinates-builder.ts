import { faker } from "@faker-js/faker";
import { Coordinates } from "../../src/dtos/ride";

export class CoordinatesBuilder {
  private readonly props = {
    lat: faker.location.latitude(),
    long: faker.location.longitude(),
  };

  public build(): Coordinates {
    return this.props;
  }
}
