import axios from "axios";
import { faker } from "@faker-js/faker";
import { RequestRideInputBuilder } from "../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { RideStatus } from "../../src/domain/entity/ride";

axios.defaults.validateStatus = (status: number) => {
  return status < 500;
};

describe("GetRide (e2e)", () => {
  it("should return ride when it exists", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(true).build();
    const signupResponse = await axios.post(
      "http://localhost:3000/v1/signup",
      signupInput
    );
    const signupOutput = signupResponse.data;
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupOutput.accountId)
      .build();
    const requestRideResponse = await axios.post(
      "http://localhost:3000/v1/request_ride",
      requestRideInput
    );
    const requestRideOutput = requestRideResponse.data;

    // when
    const rideResponse = await axios.get(
      `http://localhost:3000/v1/ride/${requestRideOutput.rideId}`
    );
    const rideOutput = rideResponse.data;

    // then
    expect(rideResponse.status).toBe(200);
    expect(rideOutput).toBeDefined();
    expect(rideOutput.passengerName).toEqual(signupInput.name);
    expect(rideOutput.passengerId).toEqual(requestRideInput.passengerId);
    expect(rideOutput.status).toBe(RideStatus.requested);
  });

  it("should return 404 status code when ride not exists", async () => {
    // given
    const rideId = faker.string.uuid();

    // when
    const rideResponse = await axios.get(
      `http://localhost:3000/v1/ride/${rideId}`
    );

    // then
    expect(rideResponse.status).toBe(404);
  });
});
