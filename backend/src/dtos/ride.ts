export enum RideStatus {
  requested = "requested",
  accepted = "accepted",
}

export interface Coordinates {
  lat: number;
  long: number;
}

export type GetRideOutput = {
  rideId: string;
  passengerId: string;
  driverId?: string;
  status: RideStatus;
  fare: number;
  distance: number;
  from: Coordinates;
  to: Coordinates;
  requestedAt: Date;
  acceptedAt?: Date;
}
