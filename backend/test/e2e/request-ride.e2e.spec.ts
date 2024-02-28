import axios from "axios";
import { RequestRideInputBuilder } from "../builders/request-ride-input-builder";
import { SignUpInputBuilder } from "../builders/signup-input-builder";

axios.defaults.validateStatus = (status: number) => {
  return status < 500;
};

describe("RequestRide (e2e)", () => {
  it("should request ride", async () => {
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

    // when
    const requestRideResponse = await axios.post(
      "http://localhost:3000/v1/request_ride",
      requestRideInput
    );

    // then
    expect(requestRideResponse.status).toEqual(200);
  });

  it("should not request ride when passenger is not found", async () => {
    // given
    const requestRideInput = new RequestRideInputBuilder().build();

    // when
    const requestRideResponse = await axios.post(
      "http://localhost:3000/v1/request_ride",
      requestRideInput
    );

    // then
    expect(requestRideResponse.status).toEqual(422);
    const requestRideOutput = requestRideResponse.data;
    expect(requestRideOutput).toEqual([{ message: "Passenger not found" }]);
  });

  it("should not request ride when account is not a passenger", async () => {
    // given
    const signupInput = new SignUpInputBuilder().withIsPassenger(false).build();
    const signupResponse = await axios.post(
      "http://localhost:3000/v1/signup",
      signupInput
    );
    const signupOutput = signupResponse.data;
    const requestRideInput = new RequestRideInputBuilder()
      .withPassengerId(signupOutput.accountId)
      .build();

    // when
    const requestRideResponse = await axios.post(
      "http://localhost:3000/v1/request_ride",
      requestRideInput
    );

    // then
    expect(requestRideResponse.status).toEqual(422);
    const requestRideOutput = requestRideResponse.data;
    expect(requestRideOutput).toEqual([
      { message: "Account is not a passenger" },
    ]);
  });

  it("should not request ride when passenger already has an active ride", async () => {
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
    await axios.post("http://localhost:3000/v1/request_ride", requestRideInput);

    // when
    const requestRideResponse = await axios.post(
      "http://localhost:3000/v1/request_ride",
      requestRideInput
    );

    // then
    expect(requestRideResponse.status).toEqual(422);
    const requestRideOutput = requestRideResponse.data;
    expect(requestRideOutput).toEqual([
      { message: "Already exists an ride in progress for this passenger" },
    ]);
  });
});
