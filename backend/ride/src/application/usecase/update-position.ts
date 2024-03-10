import { Position } from "../../domain/entity/position";
import { UpdatePositionInput } from "../../dtos/update-position-input";
import { PositionRepository } from "../../infrastructure/repository/position-repository";
import { RideRepository } from "../../infrastructure/repository/ride-repository";

export class UpdatePosition {
  public constructor(
    private readonly positionRepository: PositionRepository,
    private readonly rideRepository: RideRepository
  ) {}

  public async execute(input: UpdatePositionInput): Promise<void | Error[]> {
    const ride = await this.rideRepository.getById(input.rideId);
    if (!ride) return [new Error("Ride not found")];
    if (!ride.isStarted())
      return [new Error("Ride need to be started to update position")];
    const position = Position.create({
      coordinates: input.position,
      rideId: input.rideId,
    });

    const positionErrors = position.getErrors();
    if (positionErrors.length > 0) return positionErrors;
    await this.positionRepository.save(position);
  }
}
