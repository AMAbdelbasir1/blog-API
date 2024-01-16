import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Users } from './models/user.entity';
import { Like, Repository } from 'typeorm';
import { User } from './models/user.interface';
import { AuthService } from 'src/auth/auth.service';
import {
  paginate,
  Pagination,
  IPaginationOptions,
} from 'nestjs-typeorm-paginate';
import { createUserDto } from './DTO/create-user.dto';

@Injectable()
export class UserService {
  private Logger = new Logger('user-service');

  constructor(
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
  ) {}
  async create(user: createUserDto): Promise<User> {
    // console.log(user);
    try {
      const passwordHash = this.authService.hashPassword(user.password);
      const newUser = new Users();
      newUser.email = user.email;
      newUser.name = user.name;
      newUser.password = passwordHash;
      newUser.username = user.username;
      // const userSaved = await this.userRepository.save(newUser);
      const { password, ...res } = await this.userRepository.save(newUser);
      return res;
    } catch (error) {
      this.Logger.error(
        `when create user with data ${JSON.stringify(user)}`,
        error.stack,
      );
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }
  findAll(): Promise<User[]> {
    try {
      return this.userRepository.find();
    } catch (error) {
      this.Logger.error(`when get all users`, error.stack);
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }
  async findOne(id: number): Promise<User> {
    try {
      const found = await this.userRepository.findOne({ where: { id } });
      if (!found) {
        throw 'notFound';
      }
      delete found.password;
      return found;
    } catch (error) {
      if (error == 'notFound') {
        throw new NotFoundException(`user not found`);
      }
      this.Logger.error(`when find user with id ${id}`, error.stack);
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }
  findByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }
  delete(id: number): Promise<any> {
    try {
      return this.userRepository.delete(id); //need check found
    } catch (error) {
      this.Logger.error(`when delete user with id ${id}`, error.stack);
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }
  update(id: number, data: User): Promise<any> {
    try {
      if (data.roles) {
        delete data.roles;
      }
      return this.userRepository.update(id, data); //need check found
    } catch (error) {
      this.Logger.error(
        `${data.email} when update his account with id ${id}`,
        error.stack,
      );
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }
  updateRole(id: number, data: User): Promise<any> {
    try {
      return this.userRepository.update(id, data); //need check found
    } catch (error) {
      this.Logger.error(
        ` when admin update role for ${data.email} account with id ${id}`,
        error.stack,
      );
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }

  async uploadImage(user: User, file: string): Promise<any> {
    try {
      // console.log(file);
      const update = await this.userRepository.update(user.id, {
        profileImage: file,
      });
      if (update.affected === 0) {
        throw 'badReq';
      }
      return file;
    } catch (error) {
      if (error == 'badReq') {
        throw new BadRequestException('some errors haben when update image');
      }
      this.Logger.error(
        `${user.email}  when  update image for his account with fileName ${file}`,
        error.stack,
      );
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }
  paginate(options: IPaginationOptions): Promise<Pagination<User>> {
    try {
      return paginate<User>(this.userRepository, options);
    } catch (error) {
      this.Logger.error(
        ` when get all users account with paginatation ${JSON.stringify(
          options,
        )}`,
        error.stack,
      );
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }

  async paginateFilterByUsername(options: IPaginationOptions, user: User) {
    try {
      const skip = (+options.page - 1) * +options.limit;
      const users = await this.userRepository.findAndCount({
        skip: skip || 0,
        take: +options.limit || 10,
        order: { id: 'ASC' },
        select: ['id', 'name', 'username', 'email', 'roles'],
        where: { username: Like(`%${user.username}%`) },
      });
      return {
        items: users[0],
        links: {
          first: options.route + `?limit=${options.limit}`,
          previous: options.route + ``,
          next:
            options.route +
            `?limit=${options.limit}&page=${Number(options.page) + 1}`,
          last:
            options.route +
            `?limit=${options.limit}&page=${Math.ceil(
              users[1] / Number(options.limit),
            )}`,
        },
        meta: {
          currentPage: Number(options.page),
          itemCount: users.length,
          itemsPerPage: Number(options.limit),
          totalItems: users[1],
          totalPages: Math.ceil(users[1] / Number(options.limit)),
        },
      };
    } catch (error) {
      this.Logger.error(
        ` when get  users account by username ${
          user.username
        } and  paginatation ${JSON.stringify(options)}`,
        error.stack,
      );
      console.log(error);
      throw new InternalServerErrorException('faild process');
    }
  }
}
