import { NextFunction, Request, Response } from "express";
import jwt, { verify } from "jsonwebtoken";
import User, { Roles } from "../types/User";
import { generateAccessToken, verifyToken } from "../utils/jwt";
import db from "../db";
import createHttpError from "http-errors";

export const authenticateUser =
  (roles: Roles[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bearer = req.headers.authorization;

      if (!bearer)
        return res.status(401).json({ message: "Not authenticated" });

      const accessToken = bearer.split(" ")[1];

      if (!accessToken)
        return res.status(401).json({ message: "Not authenticated" });

      const payload: { role: any; sub: any } = verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      ) as {
        sub: string;
        role: string;
      };

      if (!roles.includes(payload.role))
        return res.status(401).json({ message: "Unauthorized" });

      const q = await db.query("SELECT * FROM users WHERE id = $1", [
        payload.sub,
      ]);

      const user = q.rows[0] as User;

      if (!user)
        return res.status(401).json({ message: "User does not exist" });

      req.user = user;

      return next();
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({ message: error.message });
      } else if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({ message: "Token has expired" });
      }
    }
  };
