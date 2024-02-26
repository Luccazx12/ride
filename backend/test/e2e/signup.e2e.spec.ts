import axios from "axios";
import { SignUpInputBuilder } from "../builders/signup-input-builder";

axios.defaults.validateStatus = (status: number) => {
  return status < 500;
};

describe("Signup (e2e)", () => {
  it("should create an passenger account", async () => {
    // given
    const input = new SignUpInputBuilder().build();

    // when
    const signupResponse = await axios.post(
      "http://localhost:3000/v1/signup",
      input
    );
    const signupOutput = signupResponse.data;

    // then
    expect(signupOutput.accountId).toBeDefined();
    const accountResponse = await axios.get(
      `http://localhost:3000/v1/accounts/${signupOutput.accountId}`
    );
    const account = accountResponse.data;
    expect(account.accountId).toEqual(signupOutput.accountId);
    expect(account.name).toEqual(input.name);
    expect(account.email).toEqual(input.email);
    expect(account.cpf).toEqual(input.cpf);
    expect(account.isPassenger).toEqual(input.isPassenger);
    expect(account.isDriver).toEqual(input.isDriver);
    expect(account.carPlate).toEqual(input.carPlate);
  });

  it.each([
    new SignUpInputBuilder().withEmail("invalid-email").build(),
    new SignUpInputBuilder()
      .withCarPlate("invalid-car-plate")
      .withIsDriver(true)
      .build(),
    new SignUpInputBuilder().withCpf("invalid-cpf").build(),
    new SignUpInputBuilder().withName("invalid-name-0").build(),
  ])("should not create passenger when data is invalid", async (input) => {
    // when

    const signupResponse = await axios.post(
      "http://localhost:3000/v1/signup",
      input
    );

    // then
    expect(signupResponse.status).toBe(422);
  });
});
