import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
  forwardRef,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BlogService } from 'src/blog/blog.service';
import { createUserDto } from 'src/user/DTO/create-user.dto';
import { UserService } from 'src/user/user.service';
@Injectable()
export class AuthService {
  private Logger = new Logger('auth-service');
  constructor(
    private jwtService: JwtService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
  ) {}
  generateJwt(payload: object): string {
    try {
      // get data from user and generate token
      return this.jwtService.sign({ user: payload });
    } catch (error) {
      // logging if unexpected error
      this.Logger.error(
        `error when generateJwt with datam${JSON.stringify(payload)}`,
        error,
      );
      throw new InternalServerErrorException('Faild proccess');
    }
  }

  hashPassword(password: string) {
    try {
      // hash password before store in database
      return bcrypt.hashSync(password, 12);
    } catch (error) {
      // logging if unexpected error
      this.Logger.error(
        `error when hash password with data ${JSON.stringify({
          password,
        })}`,
        error,
      );
      throw new InternalServerErrorException('Faild proccess');
    }
  }

  comparePassword(password: string, passwordHash: string) {
    try {
      // compare bettween password enter by user and hashed password in database
      return bcrypt.compareSync(password, passwordHash);
    } catch (error) {
      // logging if unexpected error
      this.Logger.error(
        `error when compare password with data ${JSON.stringify({
          password,
          passwordHash,
        })}`,
        error,
      );
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // signup new user in system
  async signUp(user: createUserDto) {
    try {
      // check if this email used by another user or stored in database
      const found = await this.userService.findByEmail(user.email);
      if (found) {
        throw 'badReq'; //throw error if found email
      }
      return this.userService.create(user);
    } catch (error) {
      if (error == 'badReq') {
        throw new BadRequestException('this email used before');
      }
      // console.log(error);
      this.Logger.error(`error when signUp  ${JSON.stringify(user)}`, error);
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // log in system by email and password
  async logIn(Email: string, Password: string) {
    try {
      // check if this email correct and stored in database
      const user = await this.userService.findByEmail(Email);
      if (!user) {
        throw 'unauth'; // if not found throw error
      }
      // check if the password is correct
      const valid = this.comparePassword(Password, user.password);
      if (!valid) {
        throw 'unauth';
      }
      const { password, email, roles, ...res } = user; // destructuring data from user to use as payload
      return this.generateJwt(res);
    } catch (error) {
      if (error == 'unauth') {
        throw new UnauthorizedException('email or password not correct');
      } else {
        // logging if unexpected error
        this.Logger.error(
          `error when logIn  ${JSON.stringify({ Email, Password })}`,
          error,
        );
        throw new InternalServerErrorException('Faild proccess');
      }
    }
  }
  //delete account by id
  async delete(id: number): Promise<any> {
    try {
      await this.blogService.deleteUserBlogs(id);
      return this.userService.delete(id); //need check found
    } catch (error) {
      this.Logger.error(
        `error when user delete his account with id ${id}`,
        error,
      );
      throw new InternalServerErrorException('Faild proccess');
    }
  }
}
