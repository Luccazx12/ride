import { PgPromiseAdapter } from "./infrastructure/database/database-connection";
import { GetAccount } from "./application/usecase/get-account";
import { GetRide } from "./application/usecase/get-ride";
import { ExpressAdapter } from "./infrastructure/http/http-server";
import { ConsoleMailerGateway } from "./infrastructure/gateway/mailer-gateway";
import { MainController } from "./infrastructure/http/main-controller";
import { SqlAccountRepository } from "./infrastructure/repository/account-repository";
import { SqlRideRepository } from "./infrastructure/repository/ride-repository";
import { RequestRide } from "./application/usecase/request-ride";
import { Signup } from "./application/usecase/signup";
import { Container } from "./infrastructure/dependency-injection/container";
import { InMemoryContainerStorage } from "./infrastructure/dependency-injection/in-memory-container-storage";
import {
  GetAccountDIToken,
  HttpServerDIToken,
  SignupDIToken,
  RequestRideDIToken,
  GetRideDIToken,
} from "./infrastructure/dependency-injection/di-tokens";

const container = Container.getInstance(new InMemoryContainerStorage());
const connection = new PgPromiseAdapter();
const signup = new Signup(
  new SqlAccountRepository(connection),
  new ConsoleMailerGateway()
);
const getAccount = new GetAccount(new SqlAccountRepository(connection));
const getRide = new GetRide(
  new SqlRideRepository(connection),
  new SqlAccountRepository(connection)
);
const requestRide = new RequestRide(
  new SqlAccountRepository(connection),
  new SqlRideRepository(connection)
);
const httpServer = new ExpressAdapter();
container.register(HttpServerDIToken, httpServer);
container.register(SignupDIToken, signup);
container.register(GetAccountDIToken, getAccount);
container.register(GetRideDIToken, getRide);
container.register(RequestRideDIToken, requestRide);
const mainController = new MainController();
mainController.registerHttpRoutes();
httpServer.listen(3000);
