import { RideStatus } from "../domain/entity/ride";

export interface Coordinates {
  lat: number;
  long: number;
}

export type GetRideOutput = {
  rideId: string;
  passengerId: string;
  passengerName: string;
  driverId?: string;
  status: RideStatus;
  fare: number;
  distance: number;
  from: Coordinates;
  to: Coordinates;
  requestedAt: Date;
  acceptedAt?: Date;
}
