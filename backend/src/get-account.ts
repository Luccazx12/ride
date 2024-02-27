import { AccountRepository } from "./DAO/account-repository";
import { GetAccountOutput } from "./dtos/get-account-output";

export class GetAccount {
  public constructor(private readonly AccountRepository: AccountRepository) {}

  public async execute(id: string): Promise<GetAccountOutput | null> {
    const account = await this.AccountRepository.getById(id);
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
