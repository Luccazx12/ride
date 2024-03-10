export interface DataValidator {
  isValid<T>(data: any, datatype: new () => T): boolean;
}
