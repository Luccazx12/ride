import pgp from "pg-promise";
import { Ride, RideStatus } from "../dtos/ride";

export interface RideDAO {
  listByPassengerId(passengerId: string, status: RideStatus): Promise<Ride[]>;
  getById(id: string): Promise<Ride | null>;
  save(ride: Ride): Promise<void>;
}

export class SqlRideDAO implements RideDAO {
  public async listByPassengerId(passengerId: string, status: RideStatus): Promise<Ride[]> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const rides = await connection.query(
      "select * from ride.ride where passenger_id = $1 and status = $2",
      [passengerId, status]
    );
    await connection.$pool.end();
    return rides.map((ride: any) => this.mapToRide(ride));
  }

  public async getById(id: string): Promise<Ride | null> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    const [ride] = await connection.query(
      "select * from ride.ride where ride_id = $1",
      [id]
    );

    await connection.$pool.end();
    if (!ride) return null;
    return this.mapToRide(ride);
  }

  public async save(ride: Ride): Promise<void> {
    const connection = pgp()("postgres://postgres:123456@localhost:5432/app");
    await connection.query(
      "INSERT INTO ride.ride (ride_id, passenger_id, driver_id, status, fare, distance, from_lat, from_long, to_lat, to_long, requested_at, accepted_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)",
      [
        ride.rideId,
        ride.passengerId,
        ride.driverId,
        ride.status,
        ride.fare,
        ride.distance,
        ride.from.lat,
        ride.from.long,
        ride.to.lat,
        ride.to.long,
        ride.requestedAt,
        ride.acceptedAt,
      ]
    );
    await connection.$pool.end();
  }

  private mapToRide(databaseRide: any): Ride {
    const data: Partial<Ride> = {
      rideId: databaseRide.ride_id,
      passengerId: databaseRide.passenger_id,
      status: databaseRide.status,
      fare: Number(databaseRide.fare),
      distance: Number(databaseRide.distance),
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

    return data as Ride;
  }
}
