export enum Roles {
  ADMIN = "admin",
  USER = "user",
}

class User {
  id: string;
  email: string;
  password: string;
  role: Roles;
}

export default User;
