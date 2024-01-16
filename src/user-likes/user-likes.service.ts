import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  forwardRef,
} from '@nestjs/common';
import { User_likes } from './models/user_likes.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/models/user.interface';
import { BlogService } from 'src/blog/blog.service';

@Injectable()
export class UserLikesService {
  private Logger = new Logger('userLikes-service');
  constructor(
    @InjectRepository(User_likes)
    private readonly userLikesRepository: Repository<User_likes>,
    @Inject(forwardRef(() => BlogService))
    private blogService: BlogService,
  ) {}

  async Like(blogId: number, user: User) {
    const blog = await this.blogService.getBlog(blogId);
    try {
      if (blog.likes.filter((val) => val.user.id == user.id).length) {
        throw 'badReq';
      }
      return this.userLikesRepository.save({ blog, user });
    } catch (error) {
      if (error == 'badReq') {
        throw new BadRequestException('user liked before');
      }
      this.Logger.error(
        `${user.email} when like blog with id ${blogId} `,
        error.stack,
      );
      // throw InternalServerErrorException if unexcpect error
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  unLike(blogId: number, user: User) {
    try {
      return this.userLikesRepository.delete({
        blog: { id: blogId },
        user: { id: user.id },
      });
    } catch (error) {
      this.Logger.error(
        `${user.email} when like blog with id ${blogId} `,
        error.stack,
      );
      // throw InternalServerErrorException if unexcpect error
      throw new InternalServerErrorException('Faild proccess');
    }
  }
}
