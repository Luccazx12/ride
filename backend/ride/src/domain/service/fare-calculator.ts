export abstract class FareCalculator {
  public calculate(distance: number): number {
    return distance * this.getFare();
  }

  public abstract getFare(): number;
}

export class NormalFareCalculator extends FareCalculator {
  public getFare(): number {
    return 2.1;
  }
}

export class OvernightFareCalculator extends FareCalculator {
  public getFare(): number {
    return 3.9;
  }
}

export class SundayFareCalculator extends FareCalculator {
  public getFare(): number {
    return 2.9;
  }
}

export class FareCalculatorFactory {
  public static create(date: Date): FareCalculator {
    if (date.getDay() === 0) return new SundayFareCalculator();
    if (date.getHours() <= 22 && date.getHours() >= 6)
      return new NormalFareCalculator();
    if (date.getHours() > 22 || date.getHours() < 6)
      return new OvernightFareCalculator();
    throw new Error(`Unavailable calculator to date ${date.toISOString()}`);
  }
}
