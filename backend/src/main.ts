import { PgPromiseAdapter } from "./database-connection";
import { GetAccount } from "./get-account";
import { GetRide } from "./get-ride";
import { ExpressAdapter } from "./http-server";
import { ConsoleMailerGateway } from "./mailer-gateway";
import { MainController } from "./main-controller";
import { SqlAccountRepository } from "./repository/account-repository";
import { SqlRideRepository } from "./repository/ride-repository";
import { RequestRide } from "./request-ride";
import { Signup } from "./signup";

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
