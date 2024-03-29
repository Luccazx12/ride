import { AccountGateway } from "../gateway/account-gateway";
import { RideRepository } from "../../infrastructure/repository/ride-repository";
import { RequestRideInput } from "../../dtos/request-ride-input";
import { RequestRideOutput } from "../../dtos/request-ride-output";
import { Ride, RideStatus } from "../../domain/entity/ride";

export class RequestRide {
  public constructor(
    private readonly accountGateway: AccountGateway,
    private readonly rideRepository: RideRepository
  ) {}

  public async execute(
    input: RequestRideInput
  ): Promise<RequestRideOutput | Error[]> {
    const passengerAccount = await this.accountGateway.getById(
      input.passengerId
    );
    if (!passengerAccount) return [new Error("Passenger not found")];
    if (!passengerAccount.isPassenger)
      return [new Error("Account is not a passenger")];
    const passengerRides = await this.rideRepository.listByPassengerId(
      passengerAccount.accountId,
      RideStatus.requested
    );
    if (passengerRides.length > 0)
      return [
        new Error("Already exists an ride in progress for this passenger"),
      ];
    const ride = Ride.create({ ...input, fare: 0 });
    const rideErrors = ride.getErrors();
    if (rideErrors.length > 0) return rideErrors;
    await this.rideRepository.save(ride);
    return { rideId: ride.rideId };
  }
}
