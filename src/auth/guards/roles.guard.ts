import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorator/role.decorator';
import { UserService } from 'src/user/user.service';
import { UserRole } from 'src/user/models/user.interface';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector, private userService: UserService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // get array of roles from metadata in request
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    // get user information from request
    const { user } = context.switchToHttp().getRequest();
    const userRo = await this.userService.findOne(user.id);
    if (!requiredRoles.some((role) => userRo.roles?.includes(role))) {
      throw new UnauthorizedException('can not access this root');
    }
    return true;
  }
}
