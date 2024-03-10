import { Coordinates } from "../entity/ride";

export class DistanceCalculator {
  private static readonly EARTH_RADIUS_KM = 6371;

  public static calculateDistance(from: Coordinates, to: Coordinates): number {
    const deltaLat = this.degreesToRadians(to.lat - from.lat);
    const deltaLon = this.degreesToRadians(to.long - from.long);
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(this.degreesToRadians(from.lat)) *
        Math.cos(this.degreesToRadians(to.lat)) *
        Math.sin(deltaLon / 2) *
        Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = DistanceCalculator.EARTH_RADIUS_KM * c;
    return distance;
  }

  private static degreesToRadians(degree: number): number {
    return degree * (Math.PI / 180);
  }
}
