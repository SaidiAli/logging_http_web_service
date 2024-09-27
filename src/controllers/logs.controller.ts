import { NextFunction, Request, Response } from "express";
import LogMessage from "../types/LogMessage";
import db from "../db";
import { z } from "zod";
import User from "../types/User";

const logMessageSchema = z.object({
  timestamp: z
    .string({
      required_error: "timestamp is required",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "timestamp must be a valid ISO date string",
    }), // Ensures that the timestamp is a valid date string

  level: z.enum(["info", "warning", "error"], {
    required_error: "level is required",
    invalid_type_error: "level must be one of 'info', 'warning', or 'error'",
  }), // Restricts the value of level to "info", "warning", or "error"

  text: z
    .string({
      required_error: "text is required",
    })
    .min(1, { message: "text cannot be empty" }), // Ensures the text is a non-empty string
});

const reportRequestSchema = z.object({
  startDate: z
    .string({
      required_error: "startDate is required",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "startDate must be a valid ISO date string",
    }), // Ensures that the startDate is a valid date string

  endDate: z
    .string({
      required_error: "endDate is required",
    })
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "endDate must be a valid ISO date string",
    }), // Ensures that the endDate is a valid date string
});

export default logMessageSchema;

/**
 * Receive and store log messages (user, timestamp, level, text, has
HTTP localhost URLs).
*/
export async function sendLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user as User;
  const { logs } = req.body as { logs: LogMessage[] };

  // Check if request body is an array
  if (!Array.isArray(logs)) {
    return res
      .status(400)
      .json({ message: "Request body must be an array of log messages." });
  }

  if (!logs || logs.length === 0) {
    return res.status(400).json({ message: "logs are required" });
  }

  // save logs to db
  for (const log of logs) {
    const validated = logMessageSchema.safeParse(log); // validate the log message
    const logSize = Buffer.byteLength(JSON.stringify(log), "utf-8");

    if (logSize > 100 * 1024) {
      // 100KB limit per log message
      return res
        .status(400)
        .json({ message: "Individual log message exceeds 100KB." });
    }

    if (!validated.success) {
      return res.status(400).json({
        message: validated.error.issues.map((issue) => issue.message),
      });
    }

    // add user id to log message
    log.userId = user.id;

    // check if localhost url is present in text
    const hasLocalhostUrl = log.text.match(
      /http:\/\/(localhost|127\.0\.0\.1)(:[0-9]{1,5})?(\/[^\s]*)?/
    );
    log.hasLocalhostUrl = hasLocalhostUrl ? true : false;

    await db.query(
      "INSERT INTO logs (user_id, timestamp, level, text, hasLocalhostUrl) VALUES ($1, $2, $3, $4, $5)",
      [log.userId, log.timestamp, log.level, log.text, log.hasLocalhostUrl]
    );
  }
  res.send();
}

/**
 * Generate a report on logs within a specified period.
 */
export async function generateReport(req: Request, res: Response) {
  const user = req.user as User;
  const { startDate, endDate } = req.body as {
    startDate: string;
    endDate: string;
  };

  const validated = reportRequestSchema.safeParse({ startDate, endDate }); // validate the request body

  if (!validated.success) {
    return res.status(400).json({
      message: validated.error.issues.map((issue) => issue.message),
    });
  }

  const startDateParsed = new Date(startDate);
  const endDateParsed = new Date(endDate);

  if (startDateParsed > endDateParsed) {
    return res
      .status(400)
      .json({ message: "Start date must be before end date." });
  }

  // Query logs within the specified period.
  const q = await db.query(
    "SELECT * FROM logs WHERE timestamp >= $1 AND timestamp <= $2 ORDER BY timestamp DESC",
    [startDateParsed, endDateParsed]
  );

  // The count of 'warning' log messages in the period.
  const warningCount = q.rows.filter((row) => row.level === "warning").length;

  // The count of 'error' log messages in the period.
  const errorCount = q.rows.filter((row) => row.level === "error").length;

  // The count of log messages with HTTP localhost URLs in the period.
  const messageWithUrlCount = q.rows.filter((row) =>
    Boolean(row.haslocalhosturl)
  ).length;

  res.json({
    startDate,
    endDate,
    warningCount,
    errorCount,
    messageWithUrlCount,
  });
}
