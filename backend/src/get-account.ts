import { SqlAccountDAO } from "./DAO/account-dao";

const accountDAO = new SqlAccountDAO();

export async function getAccount(id: string): Promise<any> {
  return accountDAO.getById(id);
}
