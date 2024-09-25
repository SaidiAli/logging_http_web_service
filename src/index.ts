import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import compression from "compression";
import session from "express-session";
import dotenv from "dotenv";
import morgan from "morgan";

dotenv.config();

const app = express(); // express server

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("tiny"));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 60000 },
  })
);

// app.use(express.static('public'));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

export default app;
