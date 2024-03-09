import {
  DatabaseConnection,
  PgPromiseAdapter,
} from "../../../src/infrastructure/database/database-connection";
import { PositionBuilder } from "../../builders/position-builder";
import { SqlPositionRepository } from "../../../src/infrastructure/repository/position-repository";
import { faker } from "@faker-js/faker";

describe("SqlPositionRepository (integration)", () => {
  let databaseConnection: DatabaseConnection;

  beforeAll(() => {
    databaseConnection = new PgPromiseAdapter();
  });

  afterAll(() => databaseConnection.close());

  describe("save", () => {
    it("should persist position", async () => {
      // given
      const repository = new SqlPositionRepository(databaseConnection);
      const position = new PositionBuilder().build();

      // when
      await repository.save(position);

      // then
      const foundPosition = await repository.getById(position.positionId);
      expect(foundPosition).toEqual(position);
    });
  });

  describe("getById", () => {
    it("should get position by id", async () => {
      // given
      const repository = new SqlPositionRepository(databaseConnection);
      const position = new PositionBuilder().build();
      await repository.save(position);

      // when
      const positionOutput = await repository.getById(position.positionId);

      // then
      expect(positionOutput).toEqual(position);
    });

    it("should return null when position is not found", async () => {
      // given
      const positionId = faker.string.uuid();
      const repository = new SqlPositionRepository(databaseConnection);

      // when
      const positionOutput = await repository.getById(positionId);

      // then
      expect(positionOutput).toBeNull();
    });
  });

  describe("listByRideId", () => {
    it("should list positions by rideId", async () => {
      // given
      const repository = new SqlPositionRepository(databaseConnection);
      const position = new PositionBuilder().build();
      await repository.save(position);

      // when
      const positionsOutput = await repository.listByRideId(position.rideId);

      // then
      expect(positionsOutput).toEqual([position]);
    });

    it("should return null when position is not found", async () => {
      // given
      const rideId = faker.string.uuid();
      const repository = new SqlPositionRepository(databaseConnection);

      // when
      const positionOutput = await repository.listByRideId(rideId);

      // then
      expect(positionOutput).toEqual([]);
    });
  });
});
