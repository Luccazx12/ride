import { Coordinates } from "./ride";

export type UpdatePositionInput = {
  position: Coordinates;
  rideId: string;
};
