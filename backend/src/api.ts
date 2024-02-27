import express from "express";
import { Signup } from "./signup";
import { SqlAccountRepository } from "./repository/account-repository";
import { GetAccount } from "./get-account";
import { ConsoleMailerGateway } from "./mailer-gateway";
import { GetRide } from "./get-ride";
import { SqlRideRepository } from "./repository/ride-repository";
import { RequestRide } from "./request-ride";
import { PgPromiseAdapter } from "./database-connection";

const app = express();
app.use(express.json());

app.post("/v1/signup", async (req, res) => {
  const connection = new PgPromiseAdapter();
  const signup = new Signup(
    new SqlAccountRepository(connection),
    new ConsoleMailerGateway()
  );
  const signupOutput = await signup.execute(req.body);

  if (Array.isArray(signupOutput) && signupOutput[0] instanceof Error) {
    res.status(422).json(
      signupOutput.map((e) => ({
        message: e.message,
      }))
    );
    return;
  }

  res.json(signupOutput);
});

app.get("/v1/accounts/:id", async (req, res) => {
  const connection = new PgPromiseAdapter();
  const getAccount = new GetAccount(new SqlAccountRepository(connection));
  const account = await getAccount.execute(req.params.id);

  if (!account) {
    res.status(404).send();
    return;
  }

  res.json(account);
});

app.get("/v1/ride/:id", async (req, res) => {
  const connection = new PgPromiseAdapter();
  const getAccount = new GetRide(
    new SqlRideRepository(connection),
    new SqlAccountRepository(connection)
  );
  const ride = await getAccount.execute(req.params.id);

  if (!ride) {
    res.status(404).send();
    return;
  }

  res.json(ride);
});

app.post("/v1/request_ride", async (req, res) => {
  const connection = new PgPromiseAdapter();
  const requestRide = new RequestRide(
    new SqlAccountRepository(connection),
    new SqlRideRepository(connection)
  );
  const requestRideOutput = await requestRide.execute(req.body);

  if (requestRideOutput instanceof Error) {
    res.status(422).send(requestRideOutput.message);
    return;
  }

  res.json(requestRideOutput);
});

app.listen(3000, () => console.log("listening on port 3000"));
