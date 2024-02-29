import { GetPositionsOutput } from "../../dtos/get-positions-output";
import { PositionRepository } from "../../infrastructure/repository/position-repository";

export class GetPositions {
  public constructor(private readonly positionRepository: PositionRepository) {}

  public async execute(rideId: string): Promise<GetPositionsOutput[]> {
    const positions = await this.positionRepository.listByRideId(rideId);
    return positions.map((position) => ({
      rideId: position.rideId,
      lat: position.coordinates.lat,
      long: position.coordinates.long,
      date: position.date,
      positionId: position.positionId,
    }));
  }
}
