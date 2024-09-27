export enum Roles {
  ADMIN = "admin",
  USER = "user",
}

type User = {
  id: string;
  email: string;
  password: string;
  role: Roles;
};

export default User;
