import { NextFunction, Request, Response } from "express";
import db from "../db";
import { z } from "zod";
import bcrypt from "bcrypt";
import { generateAccessToken } from "../utils/jwt";
import User from "../types/User";

// authentication data validation schema
const authSchema = z.object({
  email: z
    .string({ required_error: "email is required" })
    .email()
    .min(1, { message: "email cannot be an empty string" })
    .refine((val) => !/^\.|\/|\\|\.\.|&|["'<>]/.test(val), {
      message:
        "email contains illegal characters or starts with forbidden characters",
    }),

  password: z
    .string({ required_error: "password is required" })
    .min(8, { message: "password must be at least 8 characters long" })
    .max(15, { message: "password must be at most 15 characters long" })
    .refine((val) => !/["'<>;\\\/&]|[\x00-\x1F\x7F]/.test(val), {
      message: "password contains illegal characters or control characters",
    })
    .refine((val) => !val.startsWith("/") && !val.startsWith("."), {
      message: "password cannot start with '/' or '.'",
    }),

  role: z
    .enum(["user", "admin"], {
      invalid_type_error: "role must be 'user' or 'admin'",
    })
    .optional(),
});

/**
 * Controller to register user route
 */
export async function registerUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password, role } = req.body;

    const validated = authSchema.safeParse({ email, password, role }); // validate the request body

    if (!validated.success) {
      return res.status(400).json({
        message: validated.error.issues.map((issue) => issue.message),
      });
    }

    // check if user with email already exists
    const q = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (q.rows.length > 0) {
      return res
        .status(400)
        .json({ message: "user with email already exists" });
    }

    // create password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    // save user to db
    if (role) {
      await db.query(
        "INSERT INTO users (email, password, role) VALUES ($1, $2, $3) RETURNING *",
        [email, hashedPassword, role]
      );
    } else {
      await db.query(
        "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
        [email, hashedPassword]
      );
    }

    res.send();
  } catch (error) {
    next(error);
  }
}

/**
 * Controller to authenticate user
 */
export async function loginUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { email, password } = req.body;

    const validated = authSchema.safeParse({ email, password }); // validate the request body

    if (!validated.success) {
      return res.status(400).json({
        message: validated.error.issues.map((issue) => issue.message),
      });
    }

    // check if user with email exists
    const q = await db.query("SELECT * FROM users WHERE email = $1", [email]);

    if (q.rows.length === 0) {
      return res
        .status(400)
        .json({ message: "user with email already doesnot exist" });
    }

    const user = q.rows[0] as User;

    // check if password matches
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ message: "password is incorrect" });
    }

    // generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      role: user.role,
    });

    res.json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
}
