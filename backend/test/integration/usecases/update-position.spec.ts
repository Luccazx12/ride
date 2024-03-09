import { AcceptRide } from "../../../src/application/usecase/accept-ride";
import { GetPositions } from "../../../src/application/usecase/get-positions";
import { RequestRide } from "../../../src/application/usecase/request-ride";
import { Signup } from "../../../src/application/usecase/signup";
import { StartRide } from "../../../src/application/usecase/start-ride";
import { UpdatePosition } from "../../../src/application/usecase/update-position";
import { RequestRideOutput } from "../../../src/dtos/request-ride-output";
import { SignupOutput } from "../../../src/dtos/signup-output";
import { NoopMailerGateway } from "../../../src/infrastructure/gateway/mailer-gateway";
import { PositionRepository } from "../../../src/infrastructure/repository/position-repository";
import { AcceptRideInputBuilder } from "../../builders/accept-ride-input-builder";
import { RequestRideInputBuilder } from "../../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { UpdatePositionInputBuilder } from "../../builders/update-position-input-builder";
import { InMemoryAccountRepository } from "../../doubles/in-memory-account-repository";
import { InMemoryPositionRepository } from "../../doubles/in-memory-position-repository";
import { InMemoryRideRepository } from "../../doubles/in-memory-ride-repository";

type Subject = {
  requestRide: RequestRide;
  acceptRide: AcceptRide;
  startRide: StartRide;
  updatePosition: UpdatePosition;
  signup: Signup;
  positionRepository: PositionRepository;
};

const createSubject = (): Subject => {
  const accountRepository = new InMemoryAccountRepository();
  const rideRepository = new InMemoryRideRepository();
  const positionRepository = new InMemoryPositionRepository();

  return {
    positionRepository,
    signup: new Signup(accountRepository, new NoopMailerGateway()),
    requestRide: new RequestRide(accountRepository, rideRepository),
    acceptRide: new AcceptRide(accountRepository, rideRepository),
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
      signup,
      positionRepository,
      acceptRide,
      startRide,
      updatePosition,
    } = createSubject();
    const signupPassengerOutput = (await signup.execute(
      signupPassengerInput
    )) as SignupOutput;
    const signupDriverOutput = (await signup.execute(
      signupDriverInput
    )) as SignupOutput;
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
    const getPosition = new GetPositions(positionRepository);
    const getPositionOutput = await getPosition.execute(
      requestRideOutput.rideId
    );
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
    const { requestRide, signup, updatePosition } = createSubject();
    const signupPassengerOutput = (await signup.execute(
      signupPassengerInput
    )) as SignupOutput;

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