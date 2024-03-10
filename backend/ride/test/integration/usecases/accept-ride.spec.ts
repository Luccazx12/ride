import { GetRide } from "../../../src/application/usecase/get-ride";
import { RequestRide } from "../../../src/application/usecase/request-ride";
import { RequestRideOutput } from "../../../src/dtos/request-ride-output";
import { GetRideOutput } from "../../../src/dtos/ride";
import { SignupOutput } from "../../../src/dtos/signup-output";
import { RideRepository } from "../../../src/infrastructure/repository/ride-repository";
import { RequestRideInputBuilder } from "../../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { InMemoryAccountGateway } from "../../doubles/in-memory-account-gateway";
import { InMemoryRideRepository } from "../../doubles/in-memory-ride-repository";
import { AcceptRideInputBuilder } from "../../builders/accept-ride-input-builder";
import { AcceptRide } from "../../../src/application/usecase/accept-ride";
import { RideStatus } from "../../../src/domain/entity/ride";
import { StartRide } from "../../../src/application/usecase/start-ride";
import { AccountGateway } from "../../../src/application/gateway/account-gateway";

type Subject = {
  requestRide: RequestRide;
  acceptRide: AcceptRide;
  rideRepository: RideRepository;
  accountGateway: AccountGateway;
};

const createSubject = (): Subject => {
  const accountGateway = new InMemoryAccountGateway();
  const rideRepository = new InMemoryRideRepository();

  return {
    rideRepository,
    accountGateway,
    requestRide: new RequestRide(accountGateway, rideRepository),
    acceptRide: new AcceptRide(accountGateway, rideRepository),
  };
};

describe("AcceptRide", () => {
  it("should accept ride", async () => {
    // given
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const signupDriverInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .build();
    const { requestRide, rideRepository, accountGateway, acceptRide } =
      createSubject();
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

    // when
    await acceptRide.execute(acceptRideInput);

    // then
    const getRide = new GetRide(rideRepository, accountGateway);
    const getRideOutput = (await getRide.execute(
      acceptRideInput.rideId
    )) as GetRideOutput;
    expect(getRideOutput.acceptedAt).toBeDefined();
    expect(getRideOutput.status).toEqual(RideStatus.accepted);
  });

  it("should return error when driver already has an accepted ride", async () => {
    // given
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const secondSignupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const signupDriverInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .build();
    const { requestRide, accountGateway, acceptRide } = createSubject();
    const signupPassengerOutput = await accountGateway.signup(
      signupPassengerInput
    );
    const secondSignupPassengerOutput = await accountGateway.signup(
      secondSignupPassengerInput
    );
    const signupDriverOutput = await accountGateway.signup(signupDriverInput);

    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupPassengerOutput.accountId)
      .build();
    const secondRequestRideInput = new RequestRideInputBuilder()
      .withPassengerId(secondSignupPassengerOutput.accountId)
      .build();
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;
    const secondRequestRideOutput = (await requestRide.execute(
      secondRequestRideInput
    )) as RequestRideOutput;
    const acceptRideInput = new AcceptRideInputBuilder()
      .withRideId(requestRideOutput.rideId)
      .withDriverId(signupDriverOutput.accountId)
      .build();
    const secondAcceptRideInput = new AcceptRideInputBuilder()
      .withRideId(secondRequestRideOutput.rideId)
      .withDriverId(signupDriverOutput.accountId)
      .build();
    await acceptRide.execute(secondAcceptRideInput);

    // when
    const output = await acceptRide.execute(acceptRideInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });

  it("should return error ride is not found", async () => {
    // given
    const acceptRideInput = new AcceptRideInputBuilder().build();
    const { acceptRide } = createSubject();

    // when
    const output = await acceptRide.execute(acceptRideInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });

  it("should return error ride status is different of requested", async () => {
    // given
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const signupDriverInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .build();
    const { requestRide, accountGateway, acceptRide } = createSubject();
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

    // when
    const output = await acceptRide.execute(acceptRideInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });

  it("should return error when driver already has an in_progress ride", async () => {
    // given
    const signupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const secondSignupPassengerInput = new SignUpInputBuilder()
      .withIsPassenger(true)
      .build();
    const signupDriverInput = new SignUpInputBuilder()
      .withIsDriver(true)
      .build();
    const { requestRide, accountGateway, acceptRide, rideRepository } =
      createSubject();
    const signupPassengerOutput = await accountGateway.signup(
      signupPassengerInput
    );
    const secondSignupPassengerOutput = (await accountGateway.signup(
      secondSignupPassengerInput
    )) as SignupOutput;
    const signupDriverOutput = await accountGateway.signup(signupDriverInput);

    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupPassengerOutput.accountId)
      .build();
    const secondRequestRideInput = new RequestRideInputBuilder()
      .withPassengerId(secondSignupPassengerOutput.accountId)
      .build();
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;
    const secondRequestRideOutput = (await requestRide.execute(
      secondRequestRideInput
    )) as RequestRideOutput;
    const acceptRideInput = new AcceptRideInputBuilder()
      .withRideId(requestRideOutput.rideId)
      .withDriverId(signupDriverOutput.accountId)
      .build();
    const secondAcceptRideInput = new AcceptRideInputBuilder()
      .withRideId(secondRequestRideOutput.rideId)
      .withDriverId(signupDriverOutput.accountId)
      .build();
    await acceptRide.execute(secondAcceptRideInput);
    const startRide = new StartRide(rideRepository);
    await startRide.execute(secondRequestRideOutput.rideId);

    // when
    const output = await acceptRide.execute(acceptRideInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });
});
