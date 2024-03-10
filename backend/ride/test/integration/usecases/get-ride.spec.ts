import { faker } from "@faker-js/faker";
import { SignUpInputBuilder } from "../../builders/signup-input-builder";
import { RequestRideOutput } from "../../../src/dtos/request-ride-output";
import { GetRide } from "../../../src/application/usecase/get-ride";
import { RequestRide } from "../../../src/application/usecase/request-ride";
import { InMemoryAccountGateway } from "../../doubles/in-memory-account-gateway";
import { InMemoryRideRepository } from "../../doubles/in-memory-ride-repository";
import { RequestRideInputBuilder } from "../../builders/request-ride-input-builder";
import { GetRideOutput } from "../../../src/dtos/ride";
import { AccountGateway } from "../../../src/application/gateway/account-gateway";

type Subject = {
  requestRide: RequestRide;
  getRide: GetRide;
  accountGateway: AccountGateway;
};

const createSubject = (): Subject => {
  const accountGateway = new InMemoryAccountGateway();
  const rideRepository = new InMemoryRideRepository();

  return {
    accountGateway,
    requestRide: new RequestRide(accountGateway, rideRepository),
    getRide: new GetRide(rideRepository, accountGateway),
  };
};

describe("GetRide", () => {
  it("should return ride when it exists", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const { requestRide, accountGateway, getRide } = createSubject();
    const signupOutput = await accountGateway.signup(signupInput);
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
