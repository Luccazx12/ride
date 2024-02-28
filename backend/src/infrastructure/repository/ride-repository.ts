import { Ride, RideProperties, RideStatus } from "../../domain/entity/ride";
import { DatabaseConnection } from "../../infrastructure/database/database-connection";

export interface RideRepository {
  listByPassengerId(passengerId: string, status: RideStatus): Promise<Ride[]>;
  getById(id: string): Promise<Ride | null>;
  save(ride: Ride): Promise<void>;
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
      "INSERT INTO ride.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, requested_at, accepted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
      [
        rideProperties.rideId,
        rideProperties.passengerId,
        rideProperties.driverId,
        rideProperties.status,
        rideProperties.fare,
        ride.distance,
        rideProperties.from.lat,
        rideProperties.from.long,
        rideProperties.to.lat,
        rideProperties.to.long,
        rideProperties.requestedAt,
        rideProperties.acceptedAt,
      ]
    );
  }

  private mapToRide(databaseRide: any): Ride {
    const data: Partial<RideProperties> = {
      rideId: databaseRide.ride_id,
      passengerId: databaseRide.passenger_id,
      status: databaseRide.status,
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

    if (databaseRide.acceptedAt)
      data.acceptedAt = new Date(databaseRide.acceptedAt);
    if (databaseRide.driver_id) data.driverId = databaseRide.driver_id;

    return Ride.restore(data as RideProperties);
  }
}
