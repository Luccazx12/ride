import express from "express";
import { Signup } from "./signup";
import { SqlAccountDAO } from './DAO/account-dao';
import { GetAccount } from "./get-account";
import { ConsoleMailerGateway } from "./mailer-gateway";
import { GetRide } from "./get-ride";
import { SqlRideDAO } from "./DAO/ride-dao";
import { RequestRide } from "./request-ride";

const app = express();
app.use(express.json());

app.post("/v1/signup", async (req, res) => {
  const signup = new Signup(new SqlAccountDAO(), new ConsoleMailerGateway());
  const signupOutput = await signup.execute(req.body);

  if (signupOutput instanceof Error) {
    res.status(422).json(signupOutput.message);
    return;
  }

  res.json(signupOutput);
});

app.get("/v1/accounts/:id", async (req, res) => {
  const getAccount = new GetAccount(new SqlAccountDAO());
  const account = await getAccount.execute(req.params.id);

  if (!account) {
    res.status(404).send();
    return;
  }

  res.json(account);
});

app.get("/v1/ride/:id", async (req, res) => {
  const getAccount = new GetRide(new SqlRideDAO());
  const ride = await getAccount.execute(req.params.id);

  if (!ride) {
    res.status(404).send();
    return;
  }

  res.json(ride);
});

app.post("/v1/request_ride", async (req, res) => {
  const requestRide = new RequestRide(new SqlAccountDAO(), new SqlRideDAO());
  const requestRideOutput = await requestRide.execute(req.body);

  if (requestRideOutput instanceof Error) {
    res.status(422).send(requestRideOutput.message);
    return;
  }

  res.json(requestRideOutput);
});

app.listen(3000, () => console.log("listening on port 3000"));
