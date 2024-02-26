import { Coordinates } from "./ride";

export interface RequestRideInput {
  passengerId: string;
  from: Coordinates;
  to: Coordinates;
}
