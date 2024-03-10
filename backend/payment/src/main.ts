// import { PgPromiseAdapter } from "./infrastructure/database/database-connection";
import { ExpressAdapter } from "./infrastructure/http/http-server";
import { MainController } from "./infrastructure/http/main-controller";
import { Container } from "./infrastructure/dependency-injection/container";
import { InMemoryContainerStorage } from "./infrastructure/dependency-injection/in-memory-container-storage";
import { HttpServerDIToken } from "./infrastructure/dependency-injection/di-tokens";

const container = Container.getInstance(new InMemoryContainerStorage());
// const connection = new PgPromiseAdapter();
const httpServer = new ExpressAdapter();
container.register(HttpServerDIToken, httpServer);
const mainController = new MainController();
mainController.registerHttpRoutes();
httpServer.listen(3001);
