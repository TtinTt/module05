import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserRequest } from '../requests/create-user.request';
import { User } from '../entities/user.entity';
import { UpdateUserRequest } from '../requests/update-user.request';
import { UserResponse } from '../responses/user.response';
import { DataSource, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDSS } from 'src/common/constants';
import { UserProfile } from '../entities/user-profile.entity';
import { getFileExtension } from 'src/utilities/upload.util';
import * as fs from 'fs';

// Tài liệu: https://docs.nestjs.com/providers#services
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  //   async search(
  //     keyword?: string,
  //     page?: number,
  //     limit?: number,
  //   ): Promise<[User[], number]> {
  //     return await this.userRepository.findAndCount({
  //       relations: {
  //         profile: true,
  //         passwords: true,
  //         roles: true,
  //       },
  //       where: {
  //         username: ILike(`%${keyword || ''}%`),
  //       },
  //       order: { id: 'DESC' }, // ORDER BY
  //       take: 5, // Tương đương LIMIT
  //       skip: 0, // Tương đương OFFSET
  //     });
  //   }

  async create(
    createUser: CreateUserRequest,
    // avatar: Express.Multer.File,
  ): Promise<void> {
    console.log(createUser);

    // let originalname: string | null = null;
    // let path: string | null = null;
    // let avatarLocation: string | null = null;

    // if (avatar) {
    //   originalname = avatar.originalname;
    //   path = avatar.path;
    // }

    const isExistEmailOrUsername = await this.userRepository.findOne({
      where: [{ email: createUser.email }, { email: createUser.email }],
    });

    if (isExistEmailOrUsername) {
      throw new BadRequestException();
    }

    // let avatarPath = null;
    // if (avatar) {
    //   const avatarExtension = getFileExtension(originalname);
    //   avatarPath = `avatar/${createUser.username}.${avatarExtension}`;
    //   avatarLocation = `./public/${avatarPath}`;

    //   // Ghi file vào thư mục lưu trữ
    //   fs.writeFileSync(avatarLocation, avatar.buffer);
    // }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user: User = new User();
      //   user.username = createUser.username;
      user.email = createUser.email;
      //   user.firstName = createUser.firstName;
      //   user.lastName = createUser.lastName;
      user.password = await bcrypt.hash(createUser.password, SALT_ROUNDSS);
      await queryRunner.manager.save(user);

      //   const userProfile = new UserProfile();
      //   userProfile.gender = createUser.gender;
      //   userProfile.phoneNumber = createUser.phoneNumber;
      //   userProfile.address = createUser.address;
      //   userProfile.user = user;
      //   await queryRunner.manager.save(userProfile);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      //   if (avatarLocation) {
      //     fs.rmSync(avatarLocation);
      //   }

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  //   async find(id: number): Promise<UserResponse> {
  //     const user: User = await this.userRepository.findOneBy({ id });

  //     // Kiểm tra người dùng có tồn tại hay không ?
  //     if (!user) {
  //       throw new NotFoundException();
  //     }

  //     return new UserResponse(user);
  //   }

  //   async update(
  //     id: number,
  //     updateUser: UpdateUserRequest,
  //   ): Promise<UserResponse> {
  //     const user: User = await this.userRepository.findOneBy({ id });

  //     // Kiểm tra người dùng có tồn tại hay không ?
  //     if (!user) {
  //       throw new NotFoundException();
  //     }

  //     const userToUpdate = { ...updateUser };

  //     if (userToUpdate.password) {
  //       userToUpdate.password = await bcrypt.hash(
  //         userToUpdate.password,
  //         SALT_ROUNDSS,
  //       );
  //     } else {
  //       delete userToUpdate.password;
  //     }

  //     await this.userRepository.update({ id: id }, userToUpdate);

  //     return await this.find(id);
  //   }

  //   async delete(id: number): Promise<void> {
  //     const user: User = await this.userRepository.findOneBy({ id });

  //     // Kiểm tra người dùng có tồn tại hay không ?
  //     if (!user) {
  //       throw new NotFoundException();
  //     }

  //     this.userRepository.softRemove({ id });
  //   }
}
