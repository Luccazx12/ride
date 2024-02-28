import { RideRepository } from "../../src/infrastructure/repository/ride-repository";
import { RequestRideOutput } from "../../src/dtos/request-ride-output";
import { SignupOutput } from "../../src/dtos/signup-output";
import { GetRide } from "../../src/application/usecase/get-ride";
import { NoopMailerGateway } from "../../src/infrastructure/gateway/mailer-gateway";
import { RequestRide } from "../../src/application/usecase/request-ride";
import { Signup } from "../../src/application/usecase/signup";
import { RequestRideInputBuilder } from "../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { InMemoryAccountRepository } from "../doubles/in-memory-account-dao";
import { InMemoryRideRepository } from "../doubles/in-memory-ride-dao";
import { GetRideOutput } from "../../src/dtos/ride";
import { AccountRepository } from "../../src/infrastructure/repository/account-repository";

type Subject = {
  requestRide: RequestRide;
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
  };
};

describe("RequestRide", () => {
  it("should request ride", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, signup, rideRepository, accountRepository } =
      createSubject();
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupOutput.accountId)
      .build();

    // when
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;

    // then
    expect(requestRideOutput.rideId).toBeDefined();
    const getRide = new GetRide(rideRepository, accountRepository);
    const ride = (await getRide.execute(
      requestRideOutput.rideId
    )) as GetRideOutput;
    expect(ride.passengerId).toEqual(signupOutput.accountId);
    expect(ride.status).toEqual("requested");
  });

  it("should return error when already exists an pending ride for passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, signup } = createSubject();
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupOutput.accountId)
      .build();
    await requestRide.execute(requestRideInput);

    // when
    const requestRideOutput = await requestRide.execute(requestRideInput);

    // then
    expect(requestRideOutput).toEqual([
      new Error("Already exists an ride in progress for this passenger"),
    ]);
  });

  it("should return error when passenger is not found", async () => {
    // given
    const { requestRide } = createSubject();
    const requestRideInput = new RequestRideInputBuilder().build();

    // when
    const requestRideOutput = await requestRide.execute(requestRideInput);

    // then
    expect(requestRideOutput).toEqual([new Error("Passenger not found")]);
  });

  it("should return error when account is not passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(false).build();
    const { requestRide, signup } = createSubject();
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupOutput.accountId)
      .build();

    // when
    const requestRideOutput = await requestRide.execute(requestRideInput);

    // then
    expect(requestRideOutput).toEqual([
      new Error("Account is not a passenger"),
    ]);
  });
});
