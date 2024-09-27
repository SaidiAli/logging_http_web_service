import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerUser);

authRouter.post("/authenticate", loginUser);

export default authRouter;
