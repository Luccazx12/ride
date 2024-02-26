import { faker } from "@faker-js/faker";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { SignupOutput } from "../../src/dtos/signup-output";
import { Signup } from "../../src/signup";
import { InMemoryAccountDAO } from "../doubles/in-memory-account-dao";

interface Subject {
  requestRide: RequestRide;
  signup: Signup;
  getRide: GetRide;
}

const createSubject = (): Subject => {
  const accountDAO = new InMemoryAccountDAO();
  const rideDAO = new InMemoryRideDAO();

  return {
    signup: new Signup(accountDAO),
    requestRide: new RequestRide(accountDAO, rideDAO),
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
      .withAccountId(signupOutput.accountId)
      .build();
    const requestRideOutput = (await requestRide.execute(
      requestRideInput
    )) as RequestRideOutput;

    // when
    const ride = getRide.execute(requestRideOutput.rideId);

    // then
    expect(ride.passengerId).toEqual(signupOutput.accountId);
    expect(ride.status).toEqual("requested");
    expect(ride.from).toEqual(ride.from);
    expect(ride.to).toEqual(requestRideOutput.to);
  });

  it("should return null when ride is not found", () => {
    // given
    const { getRide } = createSubject();
    const rideId = faker.string.uuid();

    // when
    const ride = getRide.execute(rideId);

    // then
    expect(ride).toBeNull();
  });
});
