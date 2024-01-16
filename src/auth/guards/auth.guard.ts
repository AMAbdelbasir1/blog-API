import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private Logger = new Logger('auth-guard');
  constructor(
    private jwtService: JwtService,
    private userService: UserService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // get token from header request
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      // throw new UnauthorizedException('please login and try again');
      throw new ForbiddenException('please login and try again');
    }

    try {
      // check validate token and get payload
      const payload = await this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET,
      });
      // check this account found in database  and throw error if not found may be the account deleted
      await this.userService.findOne(payload.user.id);
      request.user = payload.user;
    } catch (error) {
      // catch error if invaild token or not found user account
      if (
        error.name == 'TokenExpiredError' ||
        error.name == 'JsonWebTokenError' ||
        error.name == 'NotFoundException'
      ) {
        throw new ForbiddenException('token expired or inValid');
      }
      // logging if unexpected error
      this.Logger.error(
        ` when user access by ${token} with data${JSON.stringify(
          request.user,
        )} `,
        error.stack,
      );
      // console.log(error);
      throw new InternalServerErrorException('Faild proccess');
    }
    return true;
  }
  // extract token from request
  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
