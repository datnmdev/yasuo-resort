import { Role } from '../constants/user.constants';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: Role[]) =>
  SetMetadata('roles', roles);
