import { faker } from "@faker-js/faker";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { RequestRideOutput } from "../../src/dtos/request-ride-output";
import { SignupOutput } from "../../src/dtos/signup-output";
import { GetRide } from "../../src/get-ride";
import { RequestRide } from "../../src/request-ride";
import { Signup } from "../../src/signup";
import { InMemoryAccountRepository } from "../doubles/in-memory-account-dao";
import { InMemoryRideDAO } from "../doubles/in-memory-ride-dao";
import { Ride } from "../../src/ride";
import { RequestRideInputBuilder } from "../builders/request-ride-input-builder";
import { NoopMailerGateway } from "../../src/mailer-gateway";
import { GetRideOutput } from "../../src/dtos/ride";

interface Subject {
  requestRide: RequestRide;
  signup: Signup;
  getRide: GetRide;
}

const createSubject = (): Subject => {
  const AccountRepository = new InMemoryAccountRepository();
  const rideDAO = new InMemoryRideDAO();

  return {
    signup: new Signup(AccountRepository, new NoopMailerGateway()),
    requestRide: new RequestRide(AccountRepository, rideDAO),
    getRide: new GetRide(rideDAO),
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
    const ride = (await getRide.execute(requestRideOutput.rideId)) as GetRideOutput;

    // then
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
});
