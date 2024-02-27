import { AccountRepository } from "./repository/account-repository";
import { GetAccountOutput } from "./dtos/get-account-output";

export class GetAccount {
  public constructor(private readonly accountRepository: AccountRepository) {}

  public async execute(id: string): Promise<GetAccountOutput | null> {
    const account = await this.accountRepository.getById(id);
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
