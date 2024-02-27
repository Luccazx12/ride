import crypto from "crypto";
import { AccountDAO } from "./DAO/account-dao";
import { RideDAO } from "./DAO/ride-dao";
import { RequestRideInput } from "./dtos/request-ride-input";
import { RequestRideOutput } from "./dtos/request-ride-output";
import { Coordinates, RideStatus } from "./dtos/ride";

const EARTH_RADIUS_KM = 6371;

export class RequestRide {
  public constructor(
    private readonly accountDAO: AccountDAO,
    private readonly rideDAO: RideDAO
  ) {}

  public async execute(
    input: RequestRideInput
  ): Promise<RequestRideOutput | Error> {
    const passengerAccount = await this.accountDAO.getById(input.passengerId);
    if (!passengerAccount) return new Error("Passenger not found");
    if (!passengerAccount.isPassenger)
      return new Error("Account is not a passenger");
    const passengerRides = await this.rideDAO.listByPassengerId(
      passengerAccount.accountId,
      RideStatus.requested
    );
    if (passengerRides.length > 0)
      return new Error("Already exists an ride in progress for this passenger");
    const rideId = crypto.randomUUID();
    const ride = {
      ...input,
      status: RideStatus.requested,
      requestedAt: new Date(),
      rideId,
      distance: this.calculateDistance(input.from, input.to),
      fare: 0,
    };
    await this.rideDAO.save(ride);
    return { rideId };
  }

  private calculateDistance(from: Coordinates, to: Coordinates): number {
    const deltaLat = this.degreesToRadians(to.lat - from.lat);
    const deltaLon = this.degreesToRadians(to.long - from.long);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(this.degreesToRadians(from.lat)) *
        Math.cos(this.degreesToRadians(to.lat)) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = EARTH_RADIUS_KM * c;
    return distance;
  }

  private degreesToRadians(degree: number): number {
    return degree * (Math.PI / 180);
  }
}
