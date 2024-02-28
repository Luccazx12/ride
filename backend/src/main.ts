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

const mainController = new MainController(
  httpServer,
  signup,
  getAccount,
  requestRide,
  getRide
);
mainController.registerHttpRoutes();
httpServer.listen(3000);
