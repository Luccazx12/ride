import { RideDAO } from "./DAO/ride-dao";
import { GetRideOutput } from "./dtos/ride";

export class GetRide {
  public constructor(private readonly rideDAO: RideDAO) {}

  public async execute(rideId: string): Promise<GetRideOutput | null> {
    const ride = await this.rideDAO.getById(rideId);
    if (!ride) return null;
    return {
      ...ride.getProperties(),
      distance: ride.distance,
    };
  }
}
