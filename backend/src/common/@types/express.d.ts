import { JwtPayload } from "../jwt/jwt.type";

export interface User extends JwtPayload {}

declare module 'express' {
  export interface Request {
    user?: User;
  }
}
