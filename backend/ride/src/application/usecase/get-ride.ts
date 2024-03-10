import { RideRepository } from "../../infrastructure/repository/ride-repository";
import { GetRideOutput } from "../../dtos/ride";
import { AccountGateway } from "../gateway/account-gateway";

export class GetRide {
  public constructor(
    private readonly rideRepository: RideRepository,
    private readonly accountGateway: AccountGateway
  ) {}

  public async execute(rideId: string): Promise<GetRideOutput | null> {
    const ride = await this.rideRepository.getById(rideId);
    if (!ride) return null;
    const passengerAccount = await this.accountGateway.getById(
      ride.passengerId
    );
    if (!passengerAccount) throw new Error("Passenger account not found");
    const rideProperties = ride.getProperties();
    return {
      rideId: ride.rideId,
      passengerId: rideProperties.passengerId,
      passengerName: passengerAccount.name,
      driverId: rideProperties.driverId,
      status: ride.status,
      fare: rideProperties.fare,
      distance: ride.distance,
      from: rideProperties.from,
      to: rideProperties.to,
      requestedAt: rideProperties.requestedAt,
      acceptedAt: rideProperties.acceptedAt,
      startedAt: rideProperties.startedAt,
    };
  }
}
