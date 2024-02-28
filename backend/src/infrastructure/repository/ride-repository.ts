import { Ride, RideProperties, RideStatus } from "../../domain/entity/ride";
import { DatabaseConnection } from "../../infrastructure/database/database-connection";

export interface RideRepository {
  listByPassengerId(passengerId: string, status: RideStatus): Promise<Ride[]>;
  listByDriverId(driverId: string, statuses: RideStatus[]): Promise<Ride[]>;
  getById(id: string): Promise<Ride | null>;
  save(ride: Ride): Promise<void>;
  update(ride: Ride): Promise<void>;
}

export class SqlRideRepository implements RideRepository {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async listByPassengerId(
    passengerId: string,
    status: RideStatus
  ): Promise<Ride[]> {
    const rides = await this.connection.query(
      "select * from ride.ride where passenger_id = $1 and status = $2",
      [passengerId, status]
    );
    return rides.map((ride: any) => this.mapToRide(ride));
  }

  public async listByDriverId(
    driverId: string,
    status: RideStatus[]
  ): Promise<Ride[]> {
    const rides = await this.connection.query(
      "select * from ride.ride where driver_id = $1 and status in ($2)",
      [driverId, status.join(",")]
    );
    return rides.map((ride: any) => this.mapToRide(ride));
  }

  public async getById(id: string): Promise<Ride | null> {
    const [ride] = await this.connection.query(
      "select * from ride.ride where ride_id = $1",
      [id]
    );
    if (!ride) return null;
    return this.mapToRide(ride);
  }

  public async save(ride: Ride): Promise<void> {
    const rideProperties = ride.getProperties();
    await this.connection.query(
      "INSERT INTO ride.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, requested_at, accepted_at, started_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
      [
        rideProperties.rideId,
        rideProperties.passengerId,
        rideProperties.driverId,
        ride.status,
        rideProperties.fare,
        ride.distance,
        rideProperties.from.lat,
        rideProperties.from.long,
        rideProperties.to.lat,
        rideProperties.to.long,
        rideProperties.requestedAt,
        rideProperties.acceptedAt,
        rideProperties.startedAt,
      ]
    );
  }

  public async update(ride: Ride): Promise<void> {
    const rideProperties = ride.getProperties();
    await this.connection.query(
      "UPDATE ride.ride SET passenger_id = $2, driver_id = $3, status = $4, fare = $5, distance = $6, from_lat = $7, from_long = $8, to_lat = $9, to_long = $10, requested_at = $11, accepted_at = $12, started_at = $13 WHERE ride_id = $1;",
      [
        rideProperties.rideId,
        rideProperties.passengerId,
        rideProperties.driverId,
        ride.status,
        rideProperties.fare,
        ride.distance,
        rideProperties.from.lat,
        rideProperties.from.long,
        rideProperties.to.lat,
        rideProperties.to.long,
        rideProperties.requestedAt,
        rideProperties.acceptedAt,
        rideProperties.startedAt,
      ]
    );
  }

  private mapToRide(databaseRide: any): Ride {
    const data: Partial<RideProperties> = {
      rideId: databaseRide.ride_id,
      passengerId: databaseRide.passenger_id,
      fare: Number(databaseRide.fare),
      from: {
        long: Number(databaseRide.from_long),
        lat: Number(databaseRide.from_lat),
      },
      to: {
        long: Number(databaseRide.to_long),
        lat: Number(databaseRide.to_lat),
      },
      requestedAt: new Date(databaseRide.requested_at),
    };

    if (databaseRide.accepted_at)
      data.acceptedAt = new Date(databaseRide.accepted_at);
    if (databaseRide.started_at)
      data.startedAt = new Date(databaseRide.started_at);
    if (databaseRide.driver_id) data.driverId = databaseRide.driver_id;

    return Ride.restore(data as RideProperties);
  }
}
