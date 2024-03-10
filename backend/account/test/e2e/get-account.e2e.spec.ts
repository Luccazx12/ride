import axios from "axios";
import { SignUpInputBuilder } from "../builders/signup-input-builder";
import { faker } from "@faker-js/faker";

axios.defaults.validateStatus = (status: number) => {
  return status < 500;
};

describe("GetAccount (e2e)", () => {
  it("should return account when exists", async () => {
    // given
    const signupInput = new SignUpInputBuilder().build();
    const signupResponse = await axios.post(
      "http://localhost:3001/v1/signup",
      signupInput
    );
    const signupOutput = signupResponse.data;

    // when
    const getAccountResponse = await axios.get(
      `http://localhost:3001/v1/accounts/${signupOutput.accountId}`
    );

    // then
    expect(getAccountResponse.status).toEqual(200);
    const getAccountOutput = getAccountResponse.data;
    expect(getAccountOutput.accountId).toEqual(signupOutput.accountId);
    expect(getAccountOutput.name).toEqual(signupInput.name);
    expect(getAccountOutput.email).toEqual(signupInput.email);
    expect(getAccountOutput.cpf).toEqual(signupInput.cpf);
    expect(getAccountOutput.isPassenger).toEqual(signupInput.isPassenger);
    expect(getAccountOutput.isDriver).toEqual(signupInput.isDriver);
    expect(getAccountOutput.carPlate).toEqual(signupInput.carPlate);
  });

  it("should return 404 status code when account not exists", async () => {
    // given
    const accountId = faker.string.uuid();

    // when
    const getAccountResponse = await axios.get(
      `http://localhost:3001/v1/accounts/${accountId}`
    );

    // then
    expect(getAccountResponse.status).toEqual(404);
  });
});
