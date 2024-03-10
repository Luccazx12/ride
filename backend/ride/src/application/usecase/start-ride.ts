import { RideRepository } from "../../infrastructure/repository/ride-repository";

export class StartRide {
  public constructor(private readonly rideRepository: RideRepository) {}

  public async execute(rideId: string): Promise<void | Error[]> {
    const ride = await this.rideRepository.getById(rideId);

    if (!ride) return [new Error("Ride not found")];
    ride.start();
    const rideErrors = ride.getErrors();
    if (rideErrors.length > 0) return rideErrors;
    await this.rideRepository.update(ride);
  }
}
