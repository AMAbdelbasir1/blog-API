import {
  Controller,
  Inject,
  Param,
  Post,
  UseGuards,
  forwardRef,
} from '@nestjs/common';
import { GetUser } from 'src/user/decorator/user.decorator';
import { User } from 'src/user/models/user.interface';
import { UserLikesService } from './user-likes.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('blog')
export class UserLikesController {
  constructor(
    @Inject(forwardRef(() => UserLikesService))
    private userLikesService: UserLikesService,
  ) {}
  @UseGuards(AuthGuard)
  @Post(':id/like')
  like(@Param('id') blogId: number, @GetUser() user: User) {
    return this.userLikesService.Like(blogId, user);
  }
  @UseGuards(AuthGuard)
  @Post(':id/unlike')
  unlike(@Param('id') blogId: number, @GetUser() user: User) {
    return this.userLikesService.unLike(blogId, user);
  }
}
