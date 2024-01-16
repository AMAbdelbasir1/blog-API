import { User } from 'src/user/models/user.interface';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { User_likes } from 'src/user-likes/models/user_likes.entity';
// validation on enter data before saved in database
export class createBlogDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(50)
  title: string;
  @IsOptional()
  slug?: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(20)
  @MaxLength(100)
  description?: string;

  @IsNotEmpty()
  @IsString()
  body?: string;

  @IsOptional()
  createdAt: Date;
  @IsOptional()
  updatedAt: Date;
  @IsOptional()
  likes: User_likes[];
  @IsOptional()
  author: User;
  @IsOptional()
  @IsString()
  headerImage?: string;
}
