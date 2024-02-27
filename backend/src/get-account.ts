import { AccountDAO } from "./DAO/account-dao";
import { GetAccountOutput } from "./dtos/get-account-output";

export class GetAccount {
  public constructor(private readonly accountDAO: AccountDAO) {}

  public async execute(id: string): Promise<GetAccountOutput | null> {
    const account = await this.accountDAO.getById(id);
    if (!account) return null;
    const accountProperties = account.getProperties();
    return {
      accountId: accountProperties.accountId,
      name: accountProperties.name,
      email: accountProperties.email,
      cpf: accountProperties.cpf,
      carPlate: accountProperties.carPlate,
      isPassenger: accountProperties.isPassenger,
      isDriver: accountProperties.isDriver,
    };
  }
}
