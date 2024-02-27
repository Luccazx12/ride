import { RideDAO } from "../../src/DAO/ride-dao";
import { Ride, RideStatus } from "../../src/dtos/ride";

export class InMemoryRideDAO implements RideDAO {
  private rides: Ride[] = [];

  public async listByPassengerId(
    passengerId: string,
    status: RideStatus
  ): Promise<Ride[]> {
    return this.rides.filter(
      (ride) => ride.passengerId === passengerId && ride.status === status
    );
  }

  public async getById(id: string): Promise<Ride | null> {
    const ride = this.rides.find((ride) => ride.rideId === id);
    if (!ride) return null;
    return ride;
  }

  public async save(account: Ride): Promise<void> {
    this.rides.push(account);
  }
}
