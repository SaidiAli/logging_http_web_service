import { NextFunction, Request, Response } from "express";
import jwt, { verify } from "jsonwebtoken";
import User, { Roles } from "../types/User";
import { generateAccessToken } from "../utils/jwt";
import db from "src/db";

const authenticateUser =
  (role: Roles) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      const bearerToken = req.headers.authorization;

      if (!bearerToken) {
        next("Bearer token is missing");
      }

      const [accessToken, refreshToken] = bearerToken.split(" ");

      if (!accessToken || !refreshToken) {
        next("Invalid bearer token format");
      }

      if (!accessToken && !refreshToken) {
        next("Not authenticated");
      }

      const payload: { role: any; sub: any } = verify(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET
      ) as {
        sub: string;
        role: string;
      };

      if (payload.role !== role) return next();

      const q = await db.query("SELECT * FROM users WHERE id = $1", [
        payload.sub,
      ]);

      const user = q.rows[0] as User;

      if (!user) next("User does not exist.");

      return next();
    } catch (error) {
      next(error);
    }
  };
