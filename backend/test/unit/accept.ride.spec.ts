import { GetRide } from "../../src/application/usecase/get-ride";
import { RequestRide } from "../../src/application/usecase/request-ride";
import { Signup } from "../../src/application/usecase/signup";
import { RequestRideOutput } from "../../src/dtos/request-ride-output";
import { GetRideOutput } from "../../src/dtos/ride";
import { SignupOutput } from "../../src/dtos/signup-output";
import { NoopMailerGateway } from "../../src/infrastructure/gateway/mailer-gateway";
import { AccountRepository } from "../../src/infrastructure/repository/account-repository";
import { RideRepository } from "../../src/infrastructure/repository/ride-repository";
import { RequestRideInputBuilder } from "../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { InMemoryAccountRepository } from "../doubles/in-memory-account-dao";
import { InMemoryRideRepository } from "../doubles/in-memory-ride-dao";
import { AcceptRideInputBuilder } from "../builders/accept-ride-input-builder";
import { AcceptRide } from "../../src/application/usecase/accept-ride";
import { RideStatus } from "../../src/domain/entity/ride";

type Subject = {
  requestRide: RequestRide;
  acceptRide: AcceptRide;
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
    const {
      requestRide,
      signup,
      rideRepository,
      accountRepository,
      acceptRide,
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

    // when
    await acceptRide.execute(acceptRideInput);

    // then
    const getRide = new GetRide(rideRepository, accountRepository);
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
    const { requestRide, signup, acceptRide } = createSubject();
    const signupPassengerOutput = (await signup.execute(
      signupPassengerInput
    )) as SignupOutput;
    const secondSignupPassengerOutput = (await signup.execute(
      secondSignupPassengerInput
    )) as SignupOutput;
    const signupDriverOutput = (await signup.execute(
      signupDriverInput
    )) as SignupOutput;
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
    const { requestRide, signup, acceptRide } = createSubject();
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
    const output = await acceptRide.execute(acceptRideInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });

  it.skip("should return error when driver already has an in_progress ride", async () => {
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
    const { requestRide, signup, acceptRide } = createSubject();
    const signupPassengerOutput = (await signup.execute(
      signupPassengerInput
    )) as SignupOutput;
    const secondSignupPassengerOutput = (await signup.execute(
      secondSignupPassengerInput
    )) as SignupOutput;
    const signupDriverOutput = (await signup.execute(
      signupDriverInput
    )) as SignupOutput;
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
    // await startRide.execute(secondRequestRideOutput.rideId);

    // when
    const output = await acceptRide.execute(acceptRideInput);

    // then
    expect(Array.isArray(output) && output[0] instanceof Error).toBeTruthy();
  });
});
