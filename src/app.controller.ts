import { Controller, Get, NotFoundException, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './auth/guards/auth.guard';
import { GetUser } from './user/decorator/user.decorator';
import { User } from './user/models/user.interface';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @UseGuards(AuthGuard)
  @Get()
  getHello(@GetUser() user: User): string {
    return this.appService.getHello(user.username);
  }
  // @Get('*')
  // notFound(@Req() req: Request) {
  //   throw new NotFoundException(`Route ${req.url} does not exist.`);
  // }
}
