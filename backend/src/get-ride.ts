import { RideDAO } from "./DAO/ride-dao";
import { Ride } from "./dtos/ride";

export class GetRide {
  public constructor(private readonly rideDAO: RideDAO) {}

  public async execute(rideId: string): Promise<Ride | null> {
    return this.rideDAO.getById(rideId);
  }
}
