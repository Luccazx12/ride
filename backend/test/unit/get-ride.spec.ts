import { faker } from "@faker-js/faker";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { RequestRideOutput } from "../../src/dtos/request-ride-output";
import { SignupOutput } from "../../src/dtos/signup-output";
import { GetRide } from "../../src/application/usecase/get-ride";
import { RequestRide } from "../../src/application/usecase/request-ride";
import { Signup } from "../../src/application/usecase/signup";
import { InMemoryAccountRepository } from "../doubles/in-memory-account-dao";
import { InMemoryRideRepository } from "../doubles/in-memory-ride-dao";
import { RequestRideInputBuilder } from "../builders/request-ride-input-builder";
import { NoopMailerGateway } from "../../src/infrastructure/gateway/mailer-gateway";
import { GetRideOutput } from "../../src/dtos/ride";

type Subject = {
  requestRide: RequestRide;
  signup: Signup;
  getRide: GetRide;
};

const createSubject = (): Subject => {
  const accountRepository = new InMemoryAccountRepository();
  const rideRepository = new InMemoryRideRepository();

  return {
    signup: new Signup(accountRepository, new NoopMailerGateway()),
    requestRide: new RequestRide(accountRepository, rideRepository),
    getRide: new GetRide(rideRepository, accountRepository),
  };
};

describe("GetRide", () => {
  it("should return ride when it exists", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, signup, getRide } = createSubject();
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupOutput.accountId)
      .build();
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;

    // when
    const ride = (await getRide.execute(
      requestRideOutput.rideId
    )) as GetRideOutput;

    // then
    expect(ride.passengerName).toEqual(signupInput.name);
    expect(ride.passengerId).toEqual(signupOutput.accountId);
    expect(ride.status).toEqual("requested");
    expect(ride.from).toEqual(requestRideInput.from);
    expect(ride.to).toEqual(requestRideInput.to);
  });

  it("should return null when ride is not found", async () => {
    // given
    const { getRide } = createSubject();
    const rideId = faker.string.uuid();

    // when
    const ride = await getRide.execute(rideId);

    // then
    expect(ride).toBeNull();
  });

  it("should return null when ride is not found", async () => {
    // given
    const { getRide } = createSubject();
    const rideId = faker.string.uuid();

    // when
    const ride = await getRide.execute(rideId);

    // then
    expect(ride).toBeNull();
  });
});
