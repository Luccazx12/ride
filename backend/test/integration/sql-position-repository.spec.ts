=import {
  DatabaseConnection,
  PgPromiseAdapter,
} from "../../src/infrastructure/database/database-connection";
import { PositionBuilder } from "../builders/position-builder";
import { SqlPositionRepository } from "../../src/infrastructure/repository/position-repository";

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
      const foundAccount = await repository.getById(position.positionId);
      expect(foundAccount).toEqual(position);
    });
  });
});
