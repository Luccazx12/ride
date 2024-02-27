import crypto from "crypto";

export enum RideStatus {
  requested = "requested",
  accepted = "accepted",
}

export interface Coordinates {
  lat: number;
  long: number;
}

export type RideProperties = {
  rideId: string;
  passengerId: string;
  driverId?: string;
  status: RideStatus;
  fare: number;
  from: Coordinates;
  to: Coordinates;
  requestedAt: Date;
  acceptedAt?: Date;
};

export class Ride {
  private static readonly EARTH_RADIUS_KM = 6371;

  private readonly validationErrors: Error[] = [];

  private constructor(private readonly properties: RideProperties) {
    this.validate();
  }

  public static create(
    properties: Omit<RideProperties, "status" | "rideId" | "requestedAt">
  ): Ride {
    const status = RideStatus.requested;
    const id = crypto.randomUUID();
    return new Ride({
      ...properties,
      rideId: id,
      status,
      requestedAt: new Date(),
    });
  }

  public get distance(): number {
    return this.calculateDistance(this.properties.from, this.properties.to);
  }

  public get passengerId(): string {
    return this.properties.passengerId;
  }

  public get rideId(): string {
    return this.properties.rideId;
  }

  public get status(): RideStatus {
    return this.properties.status;
  }

  private calculateDistance(from: Coordinates, to: Coordinates): number {
    const deltaLat = this.degreesToRadians(to.lat - from.lat);
    const deltaLon = this.degreesToRadians(to.long - from.long);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(this.degreesToRadians(from.lat)) *
        Math.cos(this.degreesToRadians(to.lat)) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = Ride.EARTH_RADIUS_KM * c;
    return distance;
  }

  private degreesToRadians(degree: number): number {
    return degree * (Math.PI / 180);
  }

  public static restore(properties: RideProperties): Ride {
    return new Ride(properties);
  }

  public getProperties(): RideProperties {
    return this.properties;
  }

  public getErrors(): Error[] {
    return this.validationErrors;
  }

  private validate(): void {
    //
  }
}