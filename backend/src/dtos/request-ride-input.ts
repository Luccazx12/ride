import { Coordinates } from "./ride";

export type RequestRideInput = {
  passengerId: string;
  from: Coordinates;
  to: Coordinates;
}
