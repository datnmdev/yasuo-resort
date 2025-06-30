import { Role } from "../constants/user.constants";

export class Token {
  accessToken: string;
  refreshToken: string;
}

export class JwtPayload {
  id: number;
  role: Role;
  iat?: number;
  exp?: number;
  jti?: string;
}
