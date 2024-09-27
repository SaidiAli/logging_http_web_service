import app from ".";
import http from "http";
import db from "./db";

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

let retries = 5;
(async () => {
  while (retries) {
    try {
      await db.connect(); // connect to database

      // Create tables if they don't exist
      await db.query(`
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'user'
        );
      `);

      await db.query(`
        CREATE TABLE IF NOT EXISTS logs (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          timestamp TIMESTAMP NOT NULL,
          level VARCHAR(50) NOT NULL,
          text TEXT NOT NULL,
          hasLocalhostUrl BOOLEAN NOT NULL
        );
      `);

      server.listen(port); // Listen on provided port, on all network interfaces.
      server.on("error", onError);
      server.on("listening", () => {
        let addr = server.address();
        let bind =
          typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
        console.log("Listening on " + bind);
      });

      break;
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      }
      retries -= 1;
      await new Promise((res) => setTimeout(res, 5000));
    }
  }
})();

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
  if (error.syscall !== "listen") {
    throw error;
  }

  let bind = typeof port === "string" ? "Pipe " + port : "Port " + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}
