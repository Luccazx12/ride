import { Account } from "../../domain/entity/account";

export interface AccountRepository {
  getByEmail(email: string): Promise<Account | null>;
  getById(id: string): Promise<Account | null>;
  save(account: Account): Promise<void>;
}
