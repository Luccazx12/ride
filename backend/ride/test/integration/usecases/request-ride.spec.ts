import { RideRepository } from "../../../src/infrastructure/repository/ride-repository";
import { RequestRideOutput } from "../../../src/dtos/request-ride-output";
import { SignupOutput } from "../../../src/dtos/signup-output";
import { GetRide } from "../../../src/application/usecase/get-ride";
import { RequestRide } from "../../../src/application/usecase/request-ride";
import { RequestRideInputBuilder } from "../../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { InMemoryAccountGateway } from "../../doubles/in-memory-account-gateway";
import { InMemoryRideRepository } from "../../doubles/in-memory-ride-repository";
import { GetRideOutput } from "../../../src/dtos/ride";
import { AccountGateway } from "../../../src/application/gateway/account-gateway";

type Subject = {
  requestRide: RequestRide;
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
  };
};

describe("RequestRide", () => {
  it("should request ride", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, accountGateway, rideRepository } = createSubject();
    const signupOutput = await accountGateway.signup(signupInput);
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupOutput.accountId)
      .build();

    // when
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;

    // then
    expect(requestRideOutput.rideId).toBeDefined();
    const getRide = new GetRide(rideRepository, accountGateway);
    const ride = (await getRide.execute(
      requestRideOutput.rideId
    )) as GetRideOutput;
    expect(ride.passengerId).toEqual(signupOutput.accountId);
    expect(ride.status).toEqual("requested");
  });

  it("should return error when already exists an pending ride for passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, accountGateway } = createSubject();
    const signupOutput = await accountGateway.signup(signupInput);
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
    const { requestRide, accountGateway } = createSubject();
    const signupOutput = await accountGateway.signup(signupInput);
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
