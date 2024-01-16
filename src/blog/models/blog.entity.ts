import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeUpdate,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Users } from 'src/user/models/user.entity';
import { User_likes } from 'src/user-likes/models/user_likes.entity';
// schema or model of data in database
@Entity('blogs')
export class Blogs {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  slug: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  body: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @BeforeUpdate()
  updateTimestamp() {
    this.updatedAt = new Date();
  }
  @Column({ nullable: true })
  headerImage: string;

  @Column({ nullable: true })
  publishedDate: Date;

  @Column({ nullable: true, default: false })
  isPublished: boolean;

  @ManyToOne(() => Users, (user) => user.blogEntries)
  author: Users;

  @OneToMany(() => User_likes, (likes) => likes.blog,)
  likes: User_likes[];
}
