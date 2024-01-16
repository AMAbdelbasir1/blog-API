import {
  Body,
  Controller,
  Delete,
  Logger,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUserDto } from 'src/user/DTO/create-user.dto';
import { logInDto } from './DTO/login.dto';
import { GetUser } from 'src/user/decorator/user.decorator';
import { User } from 'src/user/models/user.interface';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  // signup and login here from user service
  private Logger = new Logger('auth-controller');
  constructor(private authService: AuthService) {}
  //
  @Post('login')
  // @UsePipes(ValidationPipe)
  async logIn(@Body() user: logInDto, @Res() res) {
    this.Logger.verbose(`user logIn with ${JSON.stringify(user)}`);
    const token = await this.authService.logIn(user.email, user.password);
    return res.status(200).json({ token });
  }
  @Post('signup')
  // @UsePipes(ValidationPipe)
  async signUp(@Body() user: createUserDto, @Res() res) {
    this.Logger.verbose(`user logIn with ${JSON.stringify(user)}`);
    const token = await this.authService.signUp(user);
    return res.status(201).json({ user: token });
  }

  @UseGuards(AuthGuard)
  @Delete('deleteAcount')
  deleteMe(@GetUser() user: User): Promise<any> {
    this.Logger.verbose(`${user.email} delete your account with id ${user.id}`);
    return this.authService.delete(user.id);
  }
}
