import { SignupOutput } from "../../src/dtos/signup-output";
import { Signup } from "../../src/signup";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { InMemoryAccountDAO } from "../doubles/in-memory-account-dao";

interface Subject {
  requestRide: RequestRide;
  signup: Signup;
  rideDAO: RideDAO;
}

const createSubject = (): Subject => {
  const accountDAO = new InMemoryAccountDAO();
  const rideDAO = new InMemoryRideDAO();

  return {
    rideDAO,
    signup: new Signup(accountDAO),
    requestRide: new RequestRide(accountDAO, rideDAO),
  };
};

describe("RequestRide", () => {
  it("should request ride", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, signup, rideDAO } = createSubject();
    const signupOutput = (await signup.execute(signupInput)) as SignupOutput;
    const requestRideInput = new RequestRideInputBuilder()
      .withAccountId(signupOutput.accountId)
      .build();

    // when
    const requestRideOutput = await requestRide.execute(requestRideInput);

    // then
    expect(requestRideOutput.rideId).toBeDefined();
    const getRide = new GetRide(rideDAO);
    const ride = getRide.execute(requestRideOutput.rideId);
    expect(ride.passengerId).toEqual(signupOutput.accountId);
    expect(ride.status).toEqual("requested");
  });

  it("should return error when already exists an pending ride for passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, signup } = createSubject();
    const signupOutput = await signup.execute(signupInput);
    const requestRideInput = new RequestRideInputBuilder()
      .withAccountId(signupOutput.accountId)
      .build();
    await requestRide.execute(requestRideInput);

    // when
    const requestRideOutput = await requestRide.execute(requestRideInput);

    // then
    expect(requestRideOutput).toEqual(
      new Error("Already exists an ride in progress for this passenger")
    );
  });

  it("should return error when account is not found", async () => {
    // given
    const { requestRide } = createSubject();
    const requestRideInput = new RequestRideInputBuilder().build();

    // when
    const requestRideOutput = await requestRide.execute(requestRideInput);

    // then
    expect(requestRideOutput).toEqual(new Error("Account not found"));
  });

  it("should return error when account is not passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(false).build();
    const { requestRide, signup } = createSubject();
    const signupOutput = await signup.execute(signupInput);
    const requestRideInput = new RequestRideInputBuilder()
      .withAccountId(signupOutput.accountId)
      .build();

    // when
    const requestRideOutput = await requestRide.execute(requestRideInput);

    // then
    expect(requestRideOutput).toEqual(new Error("Account is not a passenger"));
  });
});
