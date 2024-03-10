import { Account } from "../../domain/entity/account";
import { ModelDecorator, Model, ColumnDecorator } from "../orm/model";

@ModelDecorator("ride", "account")
export class AccountModel extends Model<Account> {
  @ColumnDecorator("account_id", { isPk: true })
  public accountId: string;

  @ColumnDecorator("name")
  public name: string;

  @ColumnDecorator("email")
  public email: string;

  @ColumnDecorator("cpf")
  public cpf: string;

  @ColumnDecorator("car_plate")
  public carPlate: string;

  @ColumnDecorator("is_passenger")
  public isPassenger: boolean;

  @ColumnDecorator("is_driver")
  public isDriver: boolean;

  public constructor(
    accountId: string,
    name: string,
    email: string,
    cpf: string,
    carPlate: string,
    isPassenger: boolean,
    isDriver: boolean
  ) {
    super();
    this.accountId = accountId;
    this.name = name;
    this.cpf = cpf;
    this.carPlate = carPlate;
    this.email = email;
    this.isPassenger = isPassenger;
    this.isDriver = isDriver;
  }

  public static fromAggregate(account: Account): AccountModel {
    return new AccountModel(
      account.accountId,
      account.name,
      account.email,
      account.cpf,
      account.carPlate,
      account.isPassenger,
      account.isDriver
    );
  }

  public toAggregate(): Account {
    return Account.restore({
      email: this.email,
      cpf: this.cpf,
      isPassenger: this.isPassenger,
      isDriver: this.isDriver,
      accountId: this.accountId,
      carPlate: this.carPlate,
      name: this.name,
    });
  }
}
