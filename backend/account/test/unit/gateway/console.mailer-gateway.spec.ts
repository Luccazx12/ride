import { faker } from "@faker-js/faker";
import { ConsoleMailerGateway } from "../../../src/infrastructure/gateway/mailer-gateway";

describe("ConsoleMailerGateway", () => {
  it("should call Console.log() with mail data", async () => {
    // given
    const consoleMailerGateway = new ConsoleMailerGateway();
    console.log = jest.fn();

    // when
    await consoleMailerGateway.send(
      faker.lorem.word(),
      faker.lorem.word(),
      faker.lorem.word()
    );

    // then
    expect(console.log).toBeCalled();
  });
});
