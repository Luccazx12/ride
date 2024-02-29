import { Coordinates } from "./ride";

interface PositionProperties {
  positionId: string;
  coordinates: Coordinates;
  date: Date;
  rideId: string;
}

export class Position {
  private validationErrors: Error[] = [];

  public constructor(private readonly props: PositionProperties) {}

  public static create(
    properties: Omit<PositionProperties, "date" | "positionId">
  ): Position {
    return new Position({
      ...properties,
      date: new Date(),
      positionId: crypto.randomUUID(),
    });
  }

  public static restore(properties: PositionProperties): Position {
    return new Position(properties);
  }

  public getErrors(): Error[] {
    return this.validationErrors;
  }

  public get positionId(): string {
    return this.props.positionId;
  }

  public get coordinates(): Coordinates {
    return this.props.coordinates;
  }

  public get rideId(): string {
    return this.props.rideId;
  }

  public get date(): Date {
    return this.props.date;
  }
}
