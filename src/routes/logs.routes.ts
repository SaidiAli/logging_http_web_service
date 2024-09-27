import { Router } from "express";
import { generateReport, sendLogs } from "../controllers/logs.controller";
import { authenticateUser } from "../middleware/auth.middleware";
import { Roles } from "../types/User";

const logsRouter = Router();

logsRouter.post(
  "/send-logs",
  authenticateUser([Roles.USER, Roles.ADMIN]),
  sendLogs
);

logsRouter.post("/report", authenticateUser([Roles.ADMIN]), generateReport);

export default logsRouter;
