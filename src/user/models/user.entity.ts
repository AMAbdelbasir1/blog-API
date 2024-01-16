import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UserRole } from './user.interface';
import { Blogs } from 'src/blog/models/blog.entity';
import { User_likes } from 'src/user-likes/models/user_likes.entity';

@Entity()
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  username: string;
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  roles: UserRole;
  @Column({ nullable: true })
  profileImage: string;

  @OneToMany(() => Blogs, (blog) => blog.author)
  blogEntries: Blogs[];

  @OneToMany(() => User_likes, (likes) => likes.user)
  likes: User_likes[];
  @BeforeInsert()
  emailTolowercase() {
    this.email = this.email.toLowerCase();
  }
}
