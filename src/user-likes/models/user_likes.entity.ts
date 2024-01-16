import { Blogs } from 'src/blog/models/blog.entity';
import { Users } from 'src/user/models/user.entity';
import {
  BaseEntity,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User_likes extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @ManyToOne(() => Blogs, (blog) => blog.likes)
  @JoinColumn({ name: 'blogId' }) // This line makes blogId a foreign key
  blog: Blogs;
  @ManyToOne(() => Users, (User) => User.likes)
  @JoinColumn({ name: 'userId' }) // This line makes blogId a foreign key
  user: Users;
}
