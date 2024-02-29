import { Position } from "../../src/domain/entity/position";
import { PositionRepository } from "../../src/infrastructure/repository/position-repository";

export class InMemoryPositionRepository implements PositionRepository {
  private positions: Position[] = [];

  public async getById(id: string): Promise<Position | null> {
    const position = this.positions.find(
      (position) => position.positionId === id
    );
    if (!position) return null;
    return position;
  }

  public async listByRideId(rideId: string): Promise<Position[]> {
    return this.positions.filter((position) => position.rideId === rideId);
  }

  public async save(position: Position): Promise<void> {
    this.positions.push(position);
  }
}
