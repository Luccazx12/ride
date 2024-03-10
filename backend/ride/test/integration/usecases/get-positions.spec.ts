import { faker } from "@faker-js/faker";
import { AcceptRide } from "../../../src/application/usecase/accept-ride";
import { GetPositions } from "../../../src/application/usecase/get-positions";
import { RequestRide } from "../../../src/application/usecase/request-ride";
import { StartRide } from "../../../src/application/usecase/start-ride";
import { UpdatePosition } from "../../../src/application/usecase/update-position";
import { RequestRideOutput } from "../../../src/dtos/request-ride-output";
import { PositionRepository } from "../../../src/infrastructure/repository/position-repository";
import { AcceptRideInputBuilder } from "../../builders/accept-ride-input-builder";
import { RequestRideInputBuilder } from "../../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { UpdatePositionInputBuilder } from "../../builders/update-position-input-builder";
import { InMemoryAccountGateway } from "../../doubles/in-memory-account-gateway";
import { InMemoryPositionRepository } from "../../doubles/in-memory-position-repository";
import { InMemoryRideRepository } from "../../doubles/in-memory-ride-repository";
import { AccountGateway } from "../../../src/application/gateway/account-gateway";

type Subject = {
  requestRide: RequestRide;
  acceptRide: AcceptRide;
  startRide: StartRide;
  updatePosition: UpdatePosition;
  positionRepository: PositionRepository;
  getPositions: GetPositions;
  accountGateway: AccountGateway;
};

const createSubject = (): Subject => {
  const accountGateway = new InMemoryAccountGateway();
  const rideRepository = new InMemoryRideRepository();
  const positionRepository = new InMemoryPositionRepository();

  return {
    positionRepository,
    accountGateway,
    requestRide: new RequestRide(accountGateway, rideRepository),
    acceptRide: new AcceptRide(accountGateway, rideRepository),
    startRide: new StartRide(rideRepository),
    updatePosition: new UpdatePosition(positionRepository, rideRepository),
    getPositions: new GetPositions(positionRepository),
  };
};

describe("GetPositions", () => {
  it("should return positions", async () => {
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const signupDriverInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .build();
    const {
      requestRide,
      accountGateway,
      acceptRide,
      startRide,
      updatePosition,
      getPositions,
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
    await updatePosition.execute(updatePositionInput);

    // when
    const output = await getPositions.execute(requestRideOutput.rideId);

    // then
    expect(output[0].lat).toEqual(updatePositionInput.position.lat);
    expect(output[0].long).toEqual(updatePositionInput.position.long);
    expect(output[0].rideId).toEqual(updatePositionInput.rideId);
  });

  it("should return empty array when ride has no positions", async () => {
    // given
    const rideId = faker.string.uuid();
    const { getPositions } = createSubject();

    // when
    const output = await getPositions.execute(rideId);

    // then
    expect(output).toEqual([]);
  });
});
