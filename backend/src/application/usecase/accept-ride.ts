import { RideStatus } from "../../domain/entity/ride";
import { AcceptRideInput } from "../../dtos/accept-ride-input";
import { AccountRepository } from "../../infrastructure/repository/account-repository";
import { RideRepository } from "../../infrastructure/repository/ride-repository";

export class AcceptRide {
  public constructor(
    private readonly accountRepository: AccountRepository,
    private readonly rideRepository: RideRepository
  ) {}

  public async execute(input: AcceptRideInput): Promise<void | Error[]> {
    const account = await this.accountRepository.getById(input.driverId);
    if (!account) return [new Error("Driver account not found")];
    if (!account.isDriver) return [new Error("Account is not a driver")];
    const driverRides = await this.rideRepository.listByDriverId(
      account.accountId,
      [RideStatus.accepted, RideStatus.inProgress]
    );
    if (driverRides.length > 0)
      return [new Error("Driver already has an ride accepted or in progress")];
    const ride = await this.rideRepository.getById(input.rideId);
    if (!ride) return [new Error("Ride not found")];
    if (!ride.isRequested())
      return [new Error("Ride need to be in requested status to be accepted")];
    ride.accept(input.driverId);
    const rideErrors = ride.getErrors();
    if (rideErrors.length > 0) return rideErrors;
    await this.rideRepository.update(ride);
  }
}
