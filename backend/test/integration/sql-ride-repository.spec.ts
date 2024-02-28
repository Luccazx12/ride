import { faker } from "@faker-js/faker";
import { SqlRideRepository } from "../../src/infrastructure/repository/ride-repository";
import { RideBuilder } from "../builders/ride-builder";
import {
  DatabaseConnection,
  PgPromiseAdapter,
} from "../../src/infrastructure/database/database-connection";
import { RideStatus } from "../../src/domain/entity/ride";

describe("SqlRideRepository (integration)", () => {
  let databaseConnection: DatabaseConnection;

  beforeAll(() => {
    databaseConnection = new PgPromiseAdapter();
  });

  afterAll(() => databaseConnection.close());

  describe("save", () => {
    it("should create ride", async () => {
      // given
      const repository = new SqlRideRepository(databaseConnection);
      const ride = new RideBuilder().build();

      // when
      await repository.save(ride);

      // then
      const foundRide = await repository.getById(ride.rideId);
      expect(foundRide).toEqual(ride);
    });
  });

  describe("update", () => {
    it("should update ride", async () => {
      // given
      const repository = new SqlRideRepository(databaseConnection);
      const ride = new RideBuilder().build();
      await repository.save(ride);
      const updatedRide = new RideBuilder().withId(ride.rideId).build();

      // when
      await repository.update(updatedRide);

      // then
      const foundRide = await repository.getById(ride.rideId);
      expect(foundRide).not.toEqual(ride);
      expect(foundRide).toEqual(updatedRide);
    });
  });

  describe("getById", () => {
    it("should get ride by id", async () => {
      // given
      const repository = new SqlRideRepository(databaseConnection);
      const ride = new RideBuilder().build();
      await repository.save(ride);

      // when
      const foundRide = await repository.getById(ride.rideId);

      // then
      expect(foundRide).toBeDefined();
      expect(foundRide).toEqual(ride);
    });

    it("should return null when ride is not found by id", async () => {
      // given
      const repository = new SqlRideRepository(databaseConnection);

      // when
      const foundRide = await repository.getById(faker.string.uuid());

      // then
      expect(foundRide).toBeNull();
    });
  });

  describe("listByPassengerId", () => {
    it("should list rides by passengerId and status", async () => {
      // given
      const repository = new SqlRideRepository(databaseConnection);
      const firstRide = new RideBuilder().build();
      const secondRide = new RideBuilder()
        .withPassengerId(firstRide.passengerId)
        .build();
      await repository.save(firstRide);
      await repository.save(secondRide);

      // when
      const rides = await repository.listByPassengerId(
        firstRide.passengerId,
        firstRide.status
      );

      // then
      const expectedPersistedRides = [firstRide, secondRide];
      expect(rides.length === expectedPersistedRides.length).toBeTruthy();
      expect(rides).toEqual(expectedPersistedRides);
    });

    it("should return empty array when rides is not found", async () => {
      // given
      const repository = new SqlRideRepository(databaseConnection);

      // when
      const rides = await repository.listByPassengerId(
        faker.string.uuid(),
        RideStatus.accepted
      );

      // then
      expect(rides.length === 0).toBeTruthy();
    });
  });

  describe("listByDriverId", () => {
    it("should list rides by driverId and status", async () => {
      // given
      const driverId = faker.string.uuid();
      const repository = new SqlRideRepository(databaseConnection);
      const firstRide = new RideBuilder().withDriverId(driverId).build();
      const secondRide = new RideBuilder()
        .withDriverId(firstRide.driverId)
        .build();
      await repository.save(firstRide);
      await repository.save(secondRide);

      // when
      const rides = await repository.listByDriverId(driverId, [
        firstRide.status,
      ]);

      // then
      const expectedPersistedRides = [firstRide, secondRide];
      expect(rides.length === expectedPersistedRides.length).toBeTruthy();
      expect(rides).toEqual(expectedPersistedRides);
    });

    it("should return empty array when rides is not found", async () => {
      // given
      const repository = new SqlRideRepository(databaseConnection);

      // when
      const rides = await repository.listByDriverId(faker.string.uuid(), [
        RideStatus.accepted,
      ]);

      // then
      expect(rides.length === 0).toBeTruthy();
    });
  });
});
