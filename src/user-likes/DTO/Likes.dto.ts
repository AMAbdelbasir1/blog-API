import { Blog } from 'src/blog/models/blog.interface';
import { User } from 'src/user/models/user.interface';

export interface User_LikesDto {
  blog?: Blog;
  User?: User;
}
