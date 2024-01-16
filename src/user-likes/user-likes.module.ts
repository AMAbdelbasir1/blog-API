import { Module, forwardRef } from '@nestjs/common';
import { UserLikesService } from './user-likes.service';
import { UserLikesController } from './user-likes.controller';
import { User_likes } from './models/user_likes.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogModule } from 'src/blog/blog.module';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User_likes]),
    forwardRef(() => BlogModule),
    forwardRef(() => UserModule),
  ],
  providers: [UserLikesService],
  controllers: [UserLikesController],
  exports: [UserLikesService],
})
export class UserLikesModule {}
