import { User_likes } from 'src/user-likes/models/user_likes.entity';
import { User } from 'src/user/models/user.interface';

export interface Blog {
  id?: number;
  title?: string;
  slug?: string;
  description?: string;
  body?: string;
  createdAt?: Date;
  updatedAt?: Date;
  likes?: User_likes[];
  author?: User;
  headerImage?: string;
  publishedDate?: Date;
  isPublished?: boolean;
}
