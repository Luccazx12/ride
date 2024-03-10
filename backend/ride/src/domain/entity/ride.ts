import crypto from "crypto";
import { DistanceCalculator } from "../service/distance-calculator";

export enum RideStatus {
  requested = "requested",
  accepted = "accepted",
  inProgress = "in_progress",
}

export interface Coordinates {
  lat: number;
  long: number;
}

export type RideProperties = {
  rideId: string;
  passengerId: string;
  driverId?: string;
  fare: number;
  from: Coordinates;
  to: Coordinates;
  distance: number;
  lastPosition: Coordinates;
  requestedAt: Date;
  acceptedAt?: Date;
  startedAt?: Date;
};

export class Ride {
  private readonly validationErrors: Error[] = [];

  private constructor(private readonly properties: RideProperties) {
    this.validate();
  }

  public static create(
    properties: Omit<
      RideProperties,
      "status" | "rideId" | "requestedAt" | "distance" | "lastPosition"
    >
  ): Ride {
    const id = crypto.randomUUID();
    return new Ride({
      ...properties,
      rideId: id,
      requestedAt: new Date(),
      distance: 0,
      lastPosition: properties.from,
    });
  }

  public get distance(): number {
    return 0;
  }

  public get passengerId(): string {
    return this.properties.passengerId;
  }

  public get rideId(): string {
    return this.properties.rideId;
  }

  public get driverId(): string | undefined {
    return this.properties.driverId;
  }

  public get status(): RideStatus {
    if (!this.properties.acceptedAt) return RideStatus.requested;
    if (!this.properties.startedAt) return RideStatus.accepted;
    return RideStatus.inProgress;
  }

  public isStarted(): boolean {
    return this.status === RideStatus.inProgress;
  }

  public isAccepted(): boolean {
    return this.status === RideStatus.accepted;
  }

  public isRequested(): boolean {
    return this.status === RideStatus.requested;
  }

  public updatePosition(lat: number, long: number): void {
    if (!this.isStarted())
      this.addError(new Error("Ride need to be started to update position"));
    const newPosition = { lat, long };
    this.properties.distance += DistanceCalculator.calculateDistance(
      this.properties.lastPosition,
      newPosition
    );
    this.properties.lastPosition = newPosition;
  }

  public start(): void {
    if (!this.isAccepted())
      this.addError(new Error("Ride needs to be accepted to start"));
    this.properties.startedAt = new Date();
  }

  public accept(driverId: string): void {
    if (!this.isRequested())
      this.addError(
        new Error("Ride need to be in requested status to be accepted")
      );
    this.properties.driverId = driverId;
    this.properties.acceptedAt = new Date();
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

  private addError(error: Error): void {
    this.validationErrors.push(error);
  }

  private validate(): void {
    //
  }
}
