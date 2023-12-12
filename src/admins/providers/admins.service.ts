import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAdminRequest } from '../requests/create-admin.request';
import { Admin } from '../entities/admin.entity';
import { UpdateAdminRequest } from '../requests/update-admin.request';
import { DataSource, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
// import { AdminProfile } from '../entities/admin-profile.entity';
import { getFileExtension } from 'src/utilities/upload.util';
import * as fs from 'fs';
import { AdminResponse } from '../responses/admin.response';
import path from 'path';
import { EmailInput } from '../requests/EmailInput.request';
import { generateRandomCode } from 'src/common/function';
import * as nodemailer from 'nodemailer';
import { SearchAdminRequest } from '../requests/search-admin.request';
import { SALT_ROUNDSS } from 'src/common/constants';

// Tài liệu: https://docs.nestjs.com/providers#services
@Injectable()
export class AdminsService {
  constructor(
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private dataSource: DataSource,
  ) {}

  async search(
    name: string,
    page: number,
    limit: number,
    sortType: number,
  ): Promise<{ total: number; records: AdminResponse[] }> {
    // const { name, page, limit, sortType } = searchParams;
    const query = this.adminRepository.createQueryBuilder('admin');

    // Tìm kiếm theo email hoặc số điện thoại
    if (name) {
      const searchName = `%${name}%`.toLowerCase();
      query.andWhere(`(LOWER(admin.email) LIKE :searchName)`, { searchName });
    }

    // Lọc theo sortType
    if (sortType === 1) {
      query.andWhere('admin.status = :status', { status: 1 });
    } else if (sortType === 0) {
      query.andWhere('admin.status = :status', { status: 0 });
    }
    // Không cần điều kiện nếu sortType khác 0 hoặc 1

    // Phân trang
    query.take(limit);
    if (page) query.skip(limit * (page - 1));

    const [admins, total] = await query.getManyAndCount();

    // Chuyển đổi kết quả sang AdminResponse
    const records = admins.map((admin) => new AdminResponse(admin));

    return { total, records };
  }

  async update(
    id: number,
    updateAdminRequest: UpdateAdminRequest,
  ): Promise<AdminResponse> {
    try {
      if (id == 1 && updateAdminRequest.status == 0) {
        throw new InternalServerErrorException(
          'Không thể đình chỉ hoạt động của master admin',
        );
      }
      const admin = await this.adminRepository.findOneBy({ admin_id: id });

      if (!admin) {
        throw new NotFoundException('Admin not found');
      }

      const updateObject: Partial<Admin> = {};

      // Mã hóa mật khẩu nếu có
      if (updateAdminRequest.resetPassword) {
        console.log(
          'updateAdminRequest.password',
          updateAdminRequest.resetPassword,
        );

        updateObject.password = await bcrypt.hash(
          updateAdminRequest.resetPassword,
          SALT_ROUNDSS,
        );
      }

      // Cập nhật trạng thái nếu có
      if (updateAdminRequest.status !== undefined) {
        updateObject.status = updateAdminRequest.status;
      }

      // Cập nhật thông tin admin nếu có thay đổi
      if (Object.keys(updateObject).length > 0) {
        await this.adminRepository.update({ admin_id: id }, updateObject);
      }

      // Tìm và trả về thông tin admin sau khi cập nhật
      const updatedAdmin = await this.adminRepository.findOneBy({
        admin_id: id,
      });

      if (!updatedAdmin) {
        throw new InternalServerErrorException('Error updating admin');
      }

      return new AdminResponse(updatedAdmin);
    } catch (error) {
      // Xử lý lỗi
      throw new InternalServerErrorException(error.message);
    }
  }

  async create(createAdmin: CreateAdminRequest): Promise<void> {
    console.log(createAdmin);

    const isExistEmailOrUsername = await this.adminRepository.findOne({
      where: [{ email: createAdmin.email }, { email: createAdmin.email }],
    });

    if (isExistEmailOrUsername) {
      throw new BadRequestException();
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const admin: Admin = new Admin();
      admin.email = createAdmin.email;

      admin.password = await bcrypt.hash(createAdmin.password, SALT_ROUNDSS);

      admin.date = createAdmin.date;

      await queryRunner.manager.save(admin);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // async create(createAdmin: CreateAdminRequest): Promise<void> {
  //   console.log(createAdmin);

  //   const isExistEmailOrAdminname = await this.adminRepository.findOne({
  //     where: [{ email: createAdmin.email }, { email: createAdmin.email }],
  //   });

  //   if (isExistEmailOrAdminname) {
  //     throw new BadRequestException();
  //   }

  //   const queryRunner = this.dataSource.createQueryRunner();

  //   await queryRunner.connect();
  //   await queryRunner.startTransaction();

  //   try {
  //     const admin: Admin = new Admin();
  //     admin.email = createAdmin.email;

  //     admin.password = await bcrypt.hash(createAdmin.password, SALT_ROUNDSS);
  //     await queryRunner.manager.save(admin);

  //     await queryRunner.commitTransaction();
  //   } catch (err) {
  //     await queryRunner.rollbackTransaction();

  //     throw err;
  //   } finally {
  //     await queryRunner.release();
  //   }
  // }

  // async find(email: string): Promise<AdminResponse> {
  //   const admin: Admin = await this.adminRepository.findOneBy({ email });

  //   // Kiểm tra người dùng có tồn tại hay không ?
  //   if (!admin) {
  //     throw new NotFoundException();
  //   }
  //   return new AdminResponse(admin);
  // }

  // async update(
  //   id: number,
  //   updateAdmin: UpdateAdminRequest,
  //   img?: Express.Multer.File,
  // ): Promise<AdminResponse> {
  //   try {
  //     const admin: Admin = await this.adminRepository.findOneBy({
  //       admin_id: id,
  //     });

  //     if (!admin) {
  //       throw new NotFoundException();
  //     }

  //     const adminToUpdate = { ...updateAdmin };

  //     const path = require('path');

  //     if (img) {
  //       try {
  //         const originalname = img.originalname;
  //         const avatarExtension = getFileExtension(originalname);

  //         // Sử dụng đường dẫn tương đối từ file hiện tại đến thư mục public/avatar
  //         const avatarDir = path.resolve(__dirname, '../../../avatar');
  //         const avatarFilename = `${admin.admin_id}.${avatarExtension}`;
  //         const avatarLocation = path.join(avatarDir, avatarFilename);

  //         if (!fs.existsSync(avatarDir)) {
  //           fs.mkdirSync(avatarDir, { recursive: true });
  //         }
  //         fs.writeFileSync(avatarLocation, img.buffer);
  //         adminToUpdate.img = `avatar/${avatarFilename}`; // Lưu đường dẫn tương đối
  //       } catch (error) {
  //         console.error('Lỗi khi ghi file:', error);
  //       }
  //     } else {
  //       console.log('null image');
  //     }
  //     // Tạo một đối tượng để cập nhật

  //     if (updateAdmin.password) {
  //       adminToUpdate.password = await bcrypt.hash(
  //         updateAdmin.password,
  //         SALT_ROUNDSS,
  //       );
  //     }

  //     // Tạo một đối tượng để cập nhật với chỉ những trường hợp lệ
  //     const updateObject = {};
  //     Object.keys(adminToUpdate).forEach((key) => {
  //       if (adminToUpdate[key] !== undefined) {
  //         updateObject[key] = adminToUpdate[key];
  //       }
  //     });

  //     await this.adminRepository.update({ admin_id: id }, updateObject);

  //     await this.adminRepository.update({ admin_id: id }, adminToUpdate);
  //     console.log('2-check', adminToUpdate);

  //     return await this.find(admin.email);
  //   } catch (error) {
  //     // Xử lý lỗi
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  // async getCodeResetPass(email: EmailInput): Promise<void> {
  //   // Kiểm tra xem có người dùng với email này không
  //   const admin = await this.adminRepository.findOneBy({ email: email.email });
  //   if (!admin) {
  //     throw new NotFoundException('Không có người dùng nào có email này.');
  //   }

  //   // Tạo mã reset mật khẩu ngẫu nhiên
  //   const randomCode = generateRandomCode(); // Bạn cần phải xác định phương thức này

  //   // Cập nhật mã reset mật khẩu cho người dùng
  //   await this.adminRepository.update(
  //     { admin_id: admin.admin_id },
  //     { code: randomCode },
  //   );

  //   // Gửi mã reset qua email (lấy phần trước của mã nếu cần)
  //   const codeToSend = randomCode.split('_')[0];
  //   await this.sendEmail(email, codeToSend); // Giả định rằng EmailService có phương thức sendEmail
  // }

  // private sendEmail = (to, code) => {
  //   const mailOptions = {
  //     from: 'COZYhandmade2032@outlook.com',
  //     to: to,
  //     subject: 'Cozy - Mã đặt lại mật khẩu ',
  //     text: `Mã đặt lại mật khẩu: ${code}
  //         Lưu ý mã chỉ có hiệu lực trong vòng 5 phút.`,
  //   };

  //   let transporter = nodemailer.createTransport({
  //     host: 'smtp-mail.outlook.com', // hostname
  //     secureConnection: false, // TLS requires secureConnection to be false
  //     port: 587, // port for secure SMTP
  //     service: 'Outlook365',
  //     auth: {
  //       admin: 'COZYhandmade2032@outlook.com',
  //       pass: 'COZY2032handmade',
  //     },
  //     tls: {
  //       ciphers: 'SSLv3',
  //     },
  //   });

  //   transporter.sendMail(mailOptions, function (error, info) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log('Email sent: ' + info.response);
  //     }
  //   });
  // };

  // private isCodeExpired = (codeLong, code) => {
  //   const parts = codeLong.split('_');

  //   const codeTime = parseInt(parts[1], 10);
  //   const currentTime = Date.now();

  //   if (currentTime - codeTime < 5 * 60 * 1000 && code == parts[0]) {
  //     return true;
  //   } else {
  //     return false;
  //   }
  //   // Kiểm tra xem thời gian có chênh lệch quá 5 phút hay không
  // };

  // async resetPass(updateAdmin): Promise<void> {
  //   // Kiểm tra xem có người dùng với email này không
  //   const admin: Admin = await this.adminRepository.findOneBy({
  //     email: updateAdmin.email,
  //   });

  //   if (!admin) {
  //     throw new NotFoundException('Không có người dùng nào có email này.');
  //   }

  //   if (this.isCodeExpired(admin.code, updateAdmin.code)) {
  //     // Cập nhật mật khẩu cho người dùng
  //     await this.adminRepository.update(
  //       { admin_id: admin.admin_id },
  //       { password: await bcrypt.hash(updateAdmin.password, SALT_ROUNDSS) },
  //     );
  //     return;
  //   }

  //   throw new NotFoundException('Mã xác thực không hợp lệ hoặc đã hết hạn.');
  // }
}
