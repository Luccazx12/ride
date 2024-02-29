import { Position } from "../../domain/entity/position";
import { DatabaseConnection } from "../../infrastructure/database/database-connection";

export interface PositionRepository {
  save(position: Position): Promise<void>;
  getById(positionId: string): Promise<Position | null>;
  listByRideId(rideId: string): Promise<Position[]>;
}

export class SqlPositionRepository implements PositionRepository {
  public constructor(private readonly connection: DatabaseConnection) {}

  public async save(position: Position): Promise<void> {
    await this.connection.query(
      "INSERT INTO ride.position (position_id, ride_id, lat, long, date) VALUES ($1, $2, $3, $4, $5)",
      [
        position.positionId,
        position.rideId,
        position.coordinates.lat,
        position.coordinates.long,
        position.date,
      ]
    );
  }

  public async getById(id: string): Promise<Position | null> {
    const [position] = await this.connection.query(
      "select * from ride.position where position_id = $1",
      [id]
    );

    if (!position) return null;
    return this.mapToPosition(position);
  }

  public async listByRideId(rideId: string): Promise<Position[]> {
    const positions = await this.connection.query(
      "select * from ride.position where ride_id = $1",
      [rideId]
    );
    return positions.map((ride: any) => this.mapToPosition(ride));
  }

  private mapToPosition(databasePosition: any): Position {
    return Position.restore({
      positionId: databasePosition.position_id,
      rideId: databasePosition.ride_id,
      coordinates: {
        lat: Number(databasePosition.lat),
        long: Number(databasePosition.long),
      },
      date: new Date(databasePosition.date),
    });
  }
}
