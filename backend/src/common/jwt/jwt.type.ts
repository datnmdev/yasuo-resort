import { Role, UserStatus } from "../constants/user.constants";

export class Token {
  accessToken: string;
  refreshToken: string;
}

export class JwtPayload {
  id: number;
  role: Role;
  status: UserStatus;
  iat?: number;
  exp?: number;
  jti?: string;
}
