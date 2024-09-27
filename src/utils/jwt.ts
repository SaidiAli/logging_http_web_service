import jwt, { TokenExpiredError } from "jsonwebtoken";

const generateAccessToken = (data: { id: string; role?: string }) => {
  const accessTokenExpires = Math.floor(Date.now() / 1000) + 3600; // time for the token to expire in seconds

  const { id, role } = data;

  const payLoad = {
    sub: id,
    exp: accessTokenExpires,
    role,
    iat: Math.floor(Date.now() / 1000) - 30,
  };
  return jwt.sign(payLoad, process.env.ACCESS_TOKEN_SECRET);
};

const generateRefreshToken = (data: { id: string; role?: string }) => {
  const expiry = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // time for the token to expire in seconds

  const { id, role } = data;

  const payLoad = {
    exp: expiry,
    sub: id,
    iat: Math.floor(Date.now() / 1000) - 30,
  };

  if (role) {
    payLoad["role"] = role;
  }
  return jwt.sign(payLoad, process.env.ACCESS_TOKEN_SECRET);
};

function verifyToken(token: string): Promise<{ message: string; id: string }> {
  return new Promise((resolve, reject) =>
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      (err: any, data: { sub: string; accountType: string }) => {
        if (err instanceof TokenExpiredError) {
          reject("token_expired");
        }
        resolve({ message: "success", id: data.sub });
      }
    )
  );
}

export { generateAccessToken, generateRefreshToken, verifyToken };
