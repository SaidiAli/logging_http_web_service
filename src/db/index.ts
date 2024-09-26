import pg, { Client } from "pg";
const { Pool } = pg;

const client = new Client({
  user: "postgres",
  password: "password",
  host: "127.0.0.1",
  port: 5432,
  database: "greenhub",
});

export default client;
