import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Logger,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  forwardRef,
} from '@nestjs/common';
import { BlogService } from './blog.service';
import { Blog } from './models/blog.interface';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { GetUser } from 'src/user/decorator/user.decorator';
import { User } from 'src/user/models/user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SharpPipeCover } from './decorator/sharp.decorator';
import { createBlogDto } from './DTO/create-blog.dto';

@Controller('blogs')
export class BlogController {
  private Logger = new Logger('blog-controller');

  constructor(
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
  ) {}
  // method for create new blog
  @UseGuards(AuthGuard) //check Authentication before create
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() })) //add info about image that upload like name
  @Post()
  create(
    @UploadedFile(SharpPipeCover) file: string,
    @Body() blog: createBlogDto,
    @GetUser() user: User,
  ): Promise<Blog> {
    this.Logger.verbose(
      `${user.email} create blog with data ${JSON.stringify(blog)}`,
    );
    blog.headerImage = file;
    return this.blogService.create(user, blog);
  }
  // method for get blog and add pagination
  @Get()
  getBlogs(@Query('page') page: number, @Query('limit') limit: number) {
    // if (!limit) {
    //   limit = 10;
    // }
    if (!page) {
      page = 1;
    }
    this.Logger.verbose(
      `get blogs with data ${JSON.stringify({ page, limit })}`,
    );
    limit = limit > 100 ? 100 : limit ? limit : 10;
    return this.blogService.paginateAll({
      limit: Number(limit),
      page: Number(page),
      route: 'http://localhost:3000/blog',
    });
  }

  //get blogs belong to user and pagination it
  @Get('user/:user')
  indexByUser(
    @Query('page') page: number,
    @Query('limit') limit: number,
    @Param('user', ParseIntPipe) user: number,
  ) {
    if (!limit) {
      limit = 10;
    }
    if (!page) {
      page = 1;
    }
    this.Logger.verbose(
      `get blog by authorid ${user} data ${JSON.stringify({ page, limit })}`,
    );
    limit = limit > 100 ? 100 : limit;

    return this.blogService.paginateByUser(
      {
        limit: Number(limit),
        page: Number(page),
        route: 'http://localhost:3000/blog/user/' + user,
      },
      Number(user),
    );
  }
  //get specific blog by id
  @Get(':id')
  async getBlog(@Param('id', ParseIntPipe) id: number): Promise<Blog | any> {
    this.Logger.verbose(`get blog with id ${id}`);
    const blog = await this.blogService.getBlog(id);
    return { ...blog, likes: blog.likes.length };
  }
  // update blog by owner
  @UseGuards(AuthGuard)
  @Put(':id')
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() blog: Blog,
    @GetUser() user: User,
  ): Promise<any> {
    this.Logger.verbose(
      `${user.email} update blog with id ${id},  data ${JSON.stringify(blog)}`,
    );
    return this.blogService.updateOne(Number(id), blog, user);
  }
  // delete specific blog by owner
  @UseGuards(AuthGuard)
  @Delete(':id')
  deleteOne(
    @Param('id', ParseIntPipe) id: number,
    @GetUser() user: User,
  ): Promise<any> {
    this.Logger.verbose(`${user.email} update blog with id ${id}`);
    return this.blogService.deleteOne(Number(id), user);
  }
}

// @Get()
// getBlogs(@Query('userid') userid: number): Promise<Blog[]> {
//   return this.blogService.getBlogs(userid);
// }

// add like to blog
// @UseGuards(AuthGuard)
// @Get(':id/like')
// likeBlog(@Param('id', ParseIntPipe) id: number, @GetUser() user: User) {
//   this.Logger.verbose(`${user.email} like blog with id ${id}`);
//   return this.blogService.applyLike(id, user);
// }
