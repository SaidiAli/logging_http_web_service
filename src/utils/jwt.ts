import jwt, { TokenExpiredError } from "jsonwebtoken";

const generateAccessToken = (data: { id: string; role: string }) => {
  const accessTokenExpires = Math.floor(Date.now() / 1000) + 900; // time for the token to expire in seconds

  const { id, role } = data;

  const payLoad = {
    sub: id,
    exp: accessTokenExpires,
    role,
    iat: Math.floor(Date.now() / 1000) - 30,
  };
  return jwt.sign(payLoad, process.env.ACCESS_TOKEN_SECRET);
};

function verifyToken(token: string): Promise<{ id: string; role: string }> {
  return new Promise((resolve, reject) =>
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      (err: any, data: { sub: string; role: string }) => {
        if (err instanceof TokenExpiredError) {
          reject("token_expired");
        }
        resolve({ id: data.sub, role: data.role });
      }
    )
  );
}

export { generateAccessToken, verifyToken };
