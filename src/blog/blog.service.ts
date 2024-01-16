import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Blogs } from './models/blog.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/user/models/user.interface';
import { Blog } from './models/blog.interface';
import slugify from 'slugify';
import {
  IPaginationOptions,
  Pagination,
  paginate,
} from 'nestjs-typeorm-paginate';
import { createBlogDto } from './DTO/create-blog.dto';

@Injectable()
export class BlogService {
  private Logger = new Logger('blog-service');
  constructor(
    @InjectRepository(Blogs)
    private readonly blogRepository: Repository<Blogs>,
  ) {}
  // create new blog service
  async create(user: User, blog: createBlogDto): Promise<Blog> {
    try {
      //set information to new blog like user
      blog.author = user;
      blog.slug = slugify(blog.title);
      const newBlog = await this.blogRepository.save(blog);
      //return url of image that saved in server
      const headerImage = {
        headerImage: `${process.env.BASE_URL}/headerImages/${blog.headerImage}`,
      };
      return { ...newBlog, ...headerImage };
    } catch (error) {
      this.Logger.error(
        `${user.email} when create blog with data ${JSON.stringify(blog)}`,
        error.stack,
      ); //log if unexpicted error
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // get all blogs if send userid get depend on it
  async getBlogs(userid: number): Promise<Blog[]> {
    try {
      if (userid) {
        //check userid send with request
        const blogs = await this.blogRepository.find({
          where: { author: { id: userid } },
          relations: ['author'],
        });
        // return blogs and remove author password befor it
        return blogs.map((blog) => {
          delete blog.author.password;
          return blog;
        });
      }
      return (await this.blogRepository.find({ relations: ['author'] })).map(
        (blog) => {
          blog.headerImage = `${process.env.BASE_URL}/headerImages/${blog.headerImage}`;
          delete blog.author.password;
          return blog;
        },
      );
    } catch (error) {
      this.Logger.error(`when get blogs with userid ${userid} `, error.stack);
      // console.log(error);
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // get all blogs , paginate All it and order by likes
  count(likes) {
    return likes.length;
  }
  async paginateAll(options: IPaginationOptions): Promise<Pagination<Blog>> {
    try {
      const blog = await paginate<Blog>(this.blogRepository, options, {
        relations: ['author', 'likes'],
      });

      // return blogs and remove author password befor it
      const items = blog.items.map((item) => {
        item.headerImage = `${process.env.BASE_URL}/headerImages/${item.headerImage}`;
        delete item.author.password;
        return item;
      });
      items.sort((a, b) => b.likes.length - a.likes.length);
      return { ...blog, items };
    } catch (error) {
      this.Logger.error(
        `when get all blogs with pagination ${JSON.stringify(options)} `,
        error.stack,
      );
      // console.log(error);
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // get all blogs by send userid
  async paginateByUser(
    options: IPaginationOptions,
    userId: number,
  ): Promise<Pagination<Blog>> {
    try {
      const blog = await paginate<Blog>(this.blogRepository, options, {
        relations: ['author', 'likes'],
        where: [{ author: { id: userId } }],
      });
      // return blogs and remove author password befor it
      const items = blog.items.map((item) => {
        item.headerImage = `${process.env.BASE_URL}/headerImages/${item.headerImage}`;
        delete item.author.password;
        return item;
      });
      return { ...blog, items };
    } catch (error) {
      this.Logger.error(
        `when get blogs with pagination ${JSON.stringify(
          options,
        )} ,userid ${userId} `,
        error.stack,
      );
      // console.log(error);
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // get all blog by blog id
  async getBlog(id: number) {
    try {
      // find blog by id and relation user author information
      const blog = await this.blogRepository.findOne({
        where: { id },
        relations: ['author', 'likes.user'],
      });
      if (!blog) {
        throw 'notFound';
      }
      // set headerImage by path and remove password from author before return
      blog.headerImage = `${process.env.BASE_URL}/headerImages/${blog.headerImage}`;
      delete blog.author.password;

      return blog;
    } catch (error) {
      // if not found throw NotFoundException
      if (error == 'notFound' || error.name == 'NotFoundException') {
        throw new NotFoundException('Blog Not Found');
      }
      this.Logger.error(`when get blog with id ${id} `, error.stack);
      // throw InternalServerErrorException if unexcpect error
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // update blog from owner
  async updateOne(id: number, blog: Blog, user: User): Promise<Blog> {
    try {
      // find blog before update to check that owner the same he want to update
      const blogg = await this.blogRepository.findOne({
        where: { id },
        relations: ['author'],
      });
      if (!blogg) {
        //throw error if not found blog
        throw 'notFound';
      }
      if (blogg.author.id !== user.id) {
        //throw error if un autharized
        throw 'unauth';
      }
      const updateBlog = await this.blogRepository.update(id, blog);
      if (updateBlog.affected == 1) {
        delete blogg.author.password;
        return { ...blogg, ...blog };
      } else {
        throw 'badReq';
      }
    } catch (error) {
      if (error == 'unauth') {
        throw new UnauthorizedException('can not apply this opreation');
      } else if (error == 'notFound') {
        throw new NotFoundException('blog that you want edit may be not found');
      }
      this.Logger.error(
        `${user.email} update blog id ${id} with data ${JSON.stringify(blog)}`,
        error.stack,
      );

      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // service for delete blog by id
  async deleteOne(id: number, user: User) {
    try {
      // find blog before delete to check that owner the same he want to delete
      const blogg = await this.blogRepository.findOne({
        where: { id },
        relations: ['author'],
      });
      if (!blogg) {
        throw 'notFound'; //throw error if not found blog
      }
      if (blogg.author.id !== user.id) {
        throw 'unauth'; //throw error if un autharized
      }
      const updateBlog = await this.blogRepository.delete(id);
      if (updateBlog.affected == 1) {
        return { data: 'blog successfuly deleted' };
      }
      throw 'notFound';
    } catch (error) {
      // catch an any error or Exception
      if (error == 'unauth') {
        throw new UnauthorizedException('can not apply this opreation');
      } else if (error == 'notFound') {
        throw new NotFoundException(
          'blog that you want delete may be not found',
        );
      }
      this.Logger.error(`${user.email} delete blog id ${id}`, error.stack);
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // service for delete all blogs belong to user
  async deleteUserBlogs(id: number) {
    try {
      // delete depend on author id
      await this.blogRepository.delete({ author: { id } });
    } catch (error) {
      this.Logger.error(` delete blogs by authorId ${id}`, error.stack);
      throw new InternalServerErrorException('Faild proccess');
    }
  }
  // service to add like for specific blog
  // applyLike(id: number, user: User) {
  //   try {
  //     return this.blogRepository.increment({ id }, 'likes', 1);
  //   } catch (error) {
  //     this.Logger.error(`${user.email} like blog id ${id}`, error.stack);
  //     throw new InternalServerErrorException('Faild proccess');
  //   }
  // }
}
