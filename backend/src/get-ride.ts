import { RideRepository } from "./repository/ride-repository";
import { GetRideOutput } from "./dtos/ride";

export class GetRide {
  public constructor(private readonly rideRepository: RideRepository) {}

  public async execute(rideId: string): Promise<GetRideOutput | null> {
    const ride = await this.rideRepository.getById(rideId);
    if (!ride) return null;
    return {
      ...ride.getProperties(),
      distance: ride.distance,
    };
  }
}
