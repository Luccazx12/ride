import { PgPromiseAdapter } from "./infrastructure/database/database-connection";
import { GetAccount } from "./application/usecase/get-account";
import { ExpressAdapter } from "./infrastructure/http/http-server";
import { ConsoleMailerGateway } from "./infrastructure/gateway/mailer-gateway";
import { MainController } from "./infrastructure/http/main-controller";
import { SqlAccountRepository } from "./infrastructure/repository/sql-account-repository";
import { Signup } from "./application/usecase/signup";
import { Container } from "./infrastructure/dependency-injection/container";
import { InMemoryContainerStorage } from "./infrastructure/dependency-injection/in-memory-container-storage";
import {
  GetAccountDIToken,
  HttpServerDIToken,
  SignupDIToken,
} from "./infrastructure/dependency-injection/di-tokens";
import { SqlORM } from "./infrastructure/orm/sql-orm";

const container = Container.getInstance(new InMemoryContainerStorage());
const connection = new PgPromiseAdapter();
const orm = new SqlORM(connection);
const accountRepository = new SqlAccountRepository(orm);
const signup = new Signup(accountRepository, new ConsoleMailerGateway());
const getAccount = new GetAccount(accountRepository);
const httpServer = new ExpressAdapter();
container.register(HttpServerDIToken, httpServer);
container.register(SignupDIToken, signup);
container.register(GetAccountDIToken, getAccount);
const mainController = new MainController();
mainController.registerHttpRoutes();
httpServer.listen(3001);
