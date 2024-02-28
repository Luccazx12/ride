import { faker } from "@faker-js/faker";
import { AcceptRide } from "../../src/application/usecase/accept-ride";
import { GetRide } from "../../src/application/usecase/get-ride";
import { RequestRide } from "../../src/application/usecase/request-ride";
import { Signup } from "../../src/application/usecase/signup";
import { RideStatus } from "../../src/domain/entity/ride";
import { RequestRideOutput } from "../../src/dtos/request-ride-output";
import { GetRideOutput } from "../../src/dtos/ride";
import { SignupOutput } from "../../src/dtos/signup-output";
import { NoopMailerGateway } from "../../src/infrastructure/gateway/mailer-gateway";
import { AccountRepository } from "../../src/infrastructure/repository/account-repository";
import { RideRepository } from "../../src/infrastructure/repository/ride-repository";
import { AcceptRideInputBuilder } from "../builders/accept-ride-input-builder";
import { RequestRideInputBuilder } from "../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { InMemoryAccountRepository } from "../doubles/in-memory-account-repository";
import { InMemoryRideRepository } from "../doubles/in-memory-ride-repository";
import { StartRide } from "../../src/application/usecase/start-ride";

type Subject = {
  requestRide: RequestRide;
  acceptRide: AcceptRide;
  startRide: StartRide;
  signup: Signup;
  rideRepository: RideRepository;
  accountRepository: AccountRepository;
};

const createSubject = (): Subject => {
  const accountRepository = new InMemoryAccountRepository();
  const rideRepository = new InMemoryRideRepository();

  return {
    rideRepository,
    accountRepository,
    signup: new Signup(accountRepository, new NoopMailerGateway()),
    requestRide: new RequestRide(accountRepository, rideRepository),
    acceptRide: new AcceptRide(accountRepository, rideRepository),
    startRide: new StartRide(rideRepository),
  };
};

describe("StartRide", () => {
  it("should update ride to in_progress", async () => {
    // given
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const signupDriverInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .build();
    const {
      requestRide,
      signup,
      rideRepository,
      accountRepository,
      acceptRide,
      startRide,
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

    // when
    const output = await startRide.execute(acceptRideInput.rideId);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeFalsy();
    const getRide = new GetRide(rideRepository, accountRepository);
    const getRideOutput = (await getRide.execute(
      acceptRideInput.rideId
    )) as GetRideOutput;
    expect(getRideOutput.startedAt).toBeDefined();
    expect(getRideOutput.status).toEqual(RideStatus.inProgress);
  });

  it("should return an error when the ride has not been accepted yet", async () => {
    // given
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();

    const {
      requestRide,
      signup,
      rideRepository,
      accountRepository,
      startRide,
    } = createSubject();
    const signupPassengerOutput = (await signup.execute(
      signupPassengerInput
    )) as SignupOutput;

    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupPassengerOutput.accountId)
      .build();
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;

    // when
    const output = await startRide.execute(requestRideOutput.rideId);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
    const getRide = new GetRide(rideRepository, accountRepository);
    const getRideOutput = (await getRide.execute(
      requestRideOutput.rideId
    )) as GetRideOutput;
    expect(getRideOutput.startedAt).not.toBeDefined();
    expect(getRideOutput.status).toEqual(RideStatus.requested);
  });

  it("should return an error when ride is not found", async () => {
    // given
    const rideId = faker.string.uuid();
    const { startRide } = createSubject();

    // when
    const output = await startRide.execute(rideId);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });
});
