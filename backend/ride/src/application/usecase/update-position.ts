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
    ride.updatePosition(input.position.lat, input.position.long);
    const position = Position.create({
      coordinates: input.position,
      rideId: input.rideId,
    });
    const errors = [...position.getErrors(), ...ride.getErrors()];
    if (errors.length > 0) return errors;
    await this.positionRepository.save(position);
    await this.rideRepository.update(ride);
  }
}
