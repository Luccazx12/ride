import { RideDAO } from "../../src/DAO/ride-dao";
import { Ride } from "../../src/dtos/ride";

export class InMemoryRideDAO implements RideDAO {
  private rides: Ride[] = [];

  public async listByPassengerId(passengerId: string): Promise<Ride[]> {
    return this.rides.filter((ride) => ride.passengerId === passengerId);
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
