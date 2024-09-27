import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import session from "express-session";
import dotenv from "dotenv";
import morgan from "morgan";
import User from "./types/User";
import authRouter from "./routes/auth.routes";
import logsRouter from "./routes/logs.routes";

dotenv.config();

declare module "express" {
  interface Request {
    user?: User;
  }
}

const app = express(); // express server

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("tiny"));
app.use(express.json({ limit: '5mb' })); // limit request body size to 5mb

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);

app.use("/api", authRouter);
app.use("/api/logs", logsRouter);

app.get("/health-check", (req, res) => {
  res.send("server is up and running!");
});

export default app;
