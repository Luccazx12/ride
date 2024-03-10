import { RideRepository } from "../../src/infrastructure/repository/ride-repository";
import { Ride, RideStatus } from "../../src/domain/entity/ride";

export class InMemoryRideRepository implements RideRepository {
  private rides: Ride[] = [];

  public async listByPassengerId(
    passengerId: string,
    status: RideStatus
  ): Promise<Ride[]> {
    return this.rides.filter(
      (ride) => ride.passengerId === passengerId && ride.status === status
    );
  }

  public async listByDriverId(
    driverId: string,
    status: RideStatus[]
  ): Promise<Ride[]> {
    return this.rides.filter(
      (ride) => ride.driverId === driverId && status.includes(ride.status)
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

  public async update(ride: Ride): Promise<void> {
    const rideIndex = this.rides.findIndex(
      (value) => value.rideId === ride.rideId
    );
    if (rideIndex > 0) {
      this.rides[rideIndex] = ride;
    }
  }
}
