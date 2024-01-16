import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { User, UserRole } from './models/user.interface';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorator/role.decorator';
import { GetUser } from './decorator/user.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { join } from 'path';
import { v4 as uuid } from 'uuid';
import { SharpPipe } from './decorator/sharp.decorator';
import { createUserDto } from './DTO/create-user.dto';

export const storage = {
  storage: diskStorage({
    destination: './uploads/profileImages',
    filename: (req, file, cb) => {
      const fileName: string = uuid() + '-' + file.originalname;
      cb(null, `${fileName}`);
    },
  }),
};

@Controller('user')
export class UserController {
  private Logger = new Logger('user-controller');
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(@Body() user: createUserDto, @GetUser() admin: User): Promise<User> {
    this.Logger.verbose(
      `${admin.email} create new user with data ${JSON.stringify(user)}`,
    );
    return this.userService.create(user);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Get()
  getAlluser(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Query('username') username: string,
    @GetUser() admin: User,
  ) {
    if (!limit) {
      limit = 10;
    }
    if (!page) {
      page = 1;
    }
    this.Logger.verbose(
      `${admin.email} create new user with data ${JSON.stringify({
        username,
        page,
        limit,
      })}`,
    );
    limit = limit > 100 ? 100 : limit;
    if (username === null || username === undefined) {
      return this.userService.paginate({
        page: Number(page),
        limit: Number(limit),
        route: 'http://localhost:3000/users',
      });
    } else {
      return this.userService.paginateFilterByUsername(
        {
          page: Number(page),
          limit: Number(limit),
          route: 'http://localhost:3000/users',
        },
        { username },
      );
    }
  }
  @UseGuards(AuthGuard)
  // @Roles(UserRole.ADMIN)
  @Get('profile/:id')
  findOne(@Param('id') id: number, @GetUser() user: User): Promise<User> {
    this.Logger.verbose(`${user.email} get profile user with id ${id}`);
    return this.userService.findOne(id);
  }
  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Delete('deleteAcount/:id')
  delete(@Param('id') id: number, @GetUser() admin: User): Promise<any> {
    this.Logger.verbose(`${admin.email} delete user with id ${id}`);

    return this.userService.delete(id);
  }

  
  @UseGuards(AuthGuard)
  @Put()
  async update(@GetUser() user: User, @Body() data: User): Promise<any> {
    this.Logger.verbose(`${user.email} update his account with id ${user.id}`);
    return await this.userService.update(user.id, data);
  }

  @UseGuards(AuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Put(':id/role')
  async updateRole(
    @Param('id') id: number,
    @Body() roles: User,
    @GetUser() user: User,
  ): Promise<any> {
    this.Logger.verbose(`${user.email} update role for user  with id ${id}`);
    return await this.userService.updateRole(id, roles);
  }
  @UseGuards(AuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file', storage))
  async uploadFile(@UploadedFile() file, @GetUser() user: User): Promise<any> {
    return this.userService.uploadImage(user, file);
  }

  @UseGuards(AuthGuard)
  @Post('uploads')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile2(
    @UploadedFile(SharpPipe) file: string,
    @GetUser() user: User,
    ): Promise<any> {
      this.Logger.verbose(
        `${user.email} update upload image for his account with fileName ${file}`,
        );
        await this.userService.uploadImage(user, file);
        return { Image_url: join(process.env.BASE_URL, '/profileImages/' + file) };
  }
}

// @Get('profileimage/:imagename')
// findProfileImage(@Param('imagename') imagename: string, @Res() res) {
  //   const image = createReadStream(
    //     join(process.cwd(), '/uploads/profileImages/' + imagename),
    //   );
//   // res.set({
  //   //   'Content-Type': 'application/json',
//   //   'Content-Disposition': `attachment; filename=${imagename}`,
//   // });
//   //image.pipe(res);
//   return new StreamableFile(image);
//   // return res.sendFile(
  //   //   join(process.cwd(), '/uploads/profileImages/' + imagename),
  //   // );
  // }
  
  // @UseGuards(AuthGuard)
  // @Delete('deleteAcount')
  // deleteMe(@GetUser() user: User): Promise<any> {
  //   this.Logger.verbose(`${user.email} delete your account with id ${user.id}`);
  //   return this.userService.delete(user.id);
  // }