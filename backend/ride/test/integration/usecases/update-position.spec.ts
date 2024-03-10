import { AccountGateway } from "../../../src/application/gateway/account-gateway";
import { AcceptRide } from "../../../src/application/usecase/accept-ride";
import { GetPositions } from "../../../src/application/usecase/get-positions";
import { GetRide } from "../../../src/application/usecase/get-ride";
import { RequestRide } from "../../../src/application/usecase/request-ride";
import { StartRide } from "../../../src/application/usecase/start-ride";
import { UpdatePosition } from "../../../src/application/usecase/update-position";
import { DistanceCalculator } from "../../../src/domain/service/distance-calculator";
import { RequestRideOutput } from "../../../src/dtos/request-ride-output";
import { GetRideOutput } from "../../../src/dtos/ride";
import { PositionRepository } from "../../../src/infrastructure/repository/position-repository";
import { RideRepository } from "../../../src/infrastructure/repository/ride-repository";
import { AcceptRideInputBuilder } from "../../builders/accept-ride-input-builder";
import { RequestRideInputBuilder } from "../../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { UpdatePositionInputBuilder } from "../../builders/update-position-input-builder";
import { InMemoryAccountGateway } from "../../doubles/in-memory-account-gateway";
import { InMemoryPositionRepository } from "../../doubles/in-memory-position-repository";
import { InMemoryRideRepository } from "../../doubles/in-memory-ride-repository";

type Subject = {
  requestRide: RequestRide;
  acceptRide: AcceptRide;
  startRide: StartRide;
  updatePosition: UpdatePosition;
  positionRepository: PositionRepository;
  accountGateway: AccountGateway;
  rideRepository: RideRepository;
};

const createSubject = (): Subject => {
  const accountGateway = new InMemoryAccountGateway();
  const rideRepository = new InMemoryRideRepository();
  const positionRepository = new InMemoryPositionRepository();

  return {
    rideRepository,
    positionRepository,
    accountGateway,
    requestRide: new RequestRide(accountGateway, rideRepository),
    acceptRide: new AcceptRide(accountGateway, rideRepository),
    startRide: new StartRide(rideRepository),
    updatePosition: new UpdatePosition(positionRepository, rideRepository),
  };
};

describe("UpdatePosition", () => {
  it("should update the ride position", async () => {
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const signupDriverInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .build();
    const {
      requestRide,
      positionRepository,
      acceptRide,
      startRide,
      updatePosition,
      accountGateway,
      rideRepository,
    } = createSubject();
    const signupPassengerOutput = await accountGateway.signup(
      signupPassengerInput
    );
    const signupDriverOutput = await accountGateway.signup(signupDriverInput);
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupPassengerOutput.accountId)
      .build();
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;
    const acceptRideInput = new AcceptRideInputBuilder()
      .withRideId(requestRideOutput.rideId)
      .withDriverId(signupDriverOutput.accountId)
      .build();
    await acceptRide.execute(acceptRideInput);
    await startRide.execute(acceptRideInput.rideId);
    const updatePositionInput = new UpdatePositionInputBuilder()
      .withRideId(requestRideOutput.rideId)
      .build();

    // when
    const output = await updatePosition.execute(updatePositionInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeFalsy();
    const getRide = new GetRide(rideRepository, accountGateway);
    const getRideOutput = (await getRide.execute(
      updatePositionInput.rideId
    )) as GetRideOutput;
    const getPosition = new GetPositions(positionRepository);
    const getPositionOutput = await getPosition.execute(
      requestRideOutput.rideId
    );
    expect(getRideOutput.distance).toEqual(
      DistanceCalculator.calculateDistance(
        getRideOutput.from,
        updatePositionInput.position
      )
    );
    expect(getRideOutput.lastPosition).toEqual(updatePositionInput.position);
    expect(getPositionOutput[0].long).toEqual(
      updatePositionInput.position.long
    );
    expect(getPositionOutput[0].lat).toEqual(updatePositionInput.position.lat);
  });

  it("should return an error when the ride has not been started yet", async () => {
    // given
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const { requestRide, accountGateway, updatePosition } = createSubject();
    const signupPassengerOutput = await accountGateway.signup(
      signupPassengerInput
    );

    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupPassengerOutput.accountId)
      .build();
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;
    const updatePositionInput = new UpdatePositionInputBuilder()
      .withRideId(requestRideOutput.rideId)
      .build();

    // when
    const output = await updatePosition.execute(updatePositionInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });
});
