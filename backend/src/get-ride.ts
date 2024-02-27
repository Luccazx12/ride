import { RideRepository } from "./DAO/ride-repository";
import { GetRideOutput } from "./dtos/ride";

export class GetRide {
  public constructor(private readonly RideRepository: RideRepository) {}

  public async execute(rideId: string): Promise<GetRideOutput | null> {
    const ride = await this.RideRepository.getById(rideId);
    if (!ride) return null;
    return {
      ...ride.getProperties(),
      distance: ride.distance,
    };
  }
}
