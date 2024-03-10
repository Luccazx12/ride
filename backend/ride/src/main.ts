import { PgPromiseAdapter } from "./infrastructure/database/database-connection";
import { GetRide } from "./application/usecase/get-ride";
import { ExpressAdapter } from "./infrastructure/http/http-server";
import { MainController } from "./infrastructure/http/main-controller";
import { SqlRideRepository } from "./infrastructure/repository/ride-repository";
import { RequestRide } from "./application/usecase/request-ride";
import { Container } from "./infrastructure/dependency-injection/container";
import { InMemoryContainerStorage } from "./infrastructure/dependency-injection/in-memory-container-storage";
import {
  HttpServerDIToken,
  RequestRideDIToken,
  GetRideDIToken,
} from "./infrastructure/dependency-injection/di-tokens";
import { HttpAccountGateway } from "./infrastructure/gateway/http-account-gateway";
import { AxiosAdapter } from "./infrastructure/http/http-client/http-client";

const container = Container.getInstance(new InMemoryContainerStorage());
const connection = new PgPromiseAdapter();
const accountHttpClient = new AxiosAdapter("http://localhost:3001");
const httpAccountGateway = new HttpAccountGateway(accountHttpClient);
const sqlRideRepository = new SqlRideRepository(connection);
const getRide = new GetRide(sqlRideRepository, httpAccountGateway);
const requestRide = new RequestRide(httpAccountGateway, sqlRideRepository);
const httpServer = new ExpressAdapter();
container.register(HttpServerDIToken, httpServer);
container.register(GetRideDIToken, getRide);
container.register(RequestRideDIToken, requestRide);
const mainController = new MainController();
mainController.registerHttpRoutes();
httpServer.listen(3000);
