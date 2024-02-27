import { faker } from "@faker-js/faker";
import { SqlRideDAO } from "../../src/DAO/ride-dao";
import { RideBuilder } from "../builders/ride-builder";
import { RideStatus } from "../../src/dtos/ride";

describe("SqlRideDAO (integration)", () => {
  describe("save", () => {
    it("should create ride", async () => {
      // given
      const dao = new SqlRideDAO();
      const ride = new RideBuilder().build();

      // when
      await dao.save(ride);

      // then
      const foundRide = await dao.getById(ride.rideId);
      expect(foundRide).toEqual(ride);
    });
  });

  describe("getById", () => {
    it("should get ride by id", async () => {
      // given
      const dao = new SqlRideDAO();
      const ride = new RideBuilder().build();
      await dao.save(ride);

      // when
      const foundRide = await dao.getById(ride.rideId);

      // then
      expect(foundRide).toBeDefined();
      expect(foundRide).toEqual(ride);
    });

    it("should return null when ride is not found by id", async () => {
      // given
      const dao = new SqlRideDAO();

      // when
      const foundRide = await dao.getById(faker.string.uuid());

      // then
      expect(foundRide).toBeNull();
    });
  });

  describe("listByPassengerId", () => {
    it("should list rides by passengerId and status", async () => {
      // given
      const dao = new SqlRideDAO();
      const firstRide = new RideBuilder().build();
      const secondRide = new RideBuilder()
        .withPassengerId(firstRide.passengerId)
        .withStatus(firstRide.status)
        .build();
      await dao.save(firstRide);
      await dao.save(secondRide);

      // when
      const rides = await dao.listByPassengerId(
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
      const dao = new SqlRideDAO();

      // when
      const rides = await dao.listByPassengerId(
        faker.string.uuid(),
        RideStatus.accepted
      );

      // then
      expect(rides.length === 0).toBeTruthy();
    });
  });
});
