import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserRequest } from '../requests/create-user.request';
import { User } from '../entities/user.entity';
import { UpdateUserRequest } from '../requests/update-user.request';
import { DataSource, ILike, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDSS } from 'src/common/constants';
// import { UserProfile } from '../entities/user-profile.entity';
import { getFileExtension } from 'src/utilities/upload.util';
import * as fs from 'fs';
import { UserResponse } from '../responses/user.response';
import path from 'path';
import { EmailInput } from '../requests/EmailInput.request';
import { generateRandomCode } from 'src/common/function';
import * as nodemailer from 'nodemailer';
import { JwtService } from '@nestjs/jwt';
import { JWT_SECRET } from 'src/common/constants';
import { sendEmail } from 'src/common/email.server';

// Tài liệu: https://docs.nestjs.com/providers#services
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private dataSource: DataSource,
    private jwtService: JwtService,
  ) {}

  async search(
    name: string,
    page: number,
    limit: number,
    sortType: number,
  ): Promise<{ total: number; records: UserResponse[] }> {
    const query = this.userRepository.createQueryBuilder('user');

    // Tìm kiếm theo email, tên hoặc số điện thoại
    if (name) {
      name = `%${name}%`.toLowerCase();
      query.andWhere(
        `(LOWER(user.email) LIKE :name OR LOWER(user.name) LIKE :name OR LOWER(user.phone) LIKE :name)`,
        { name },
      );
    }

    // Lọc theo sortType
    if (sortType === 1) {
      query.andWhere('user.status = :status', { status: 1 });
    } else if (sortType === 0) {
      query.andWhere('user.status = :status', { status: 0 });
    }
    // Không cần điều kiện nếu sortType === 2

    // Phân trang
    query.take(limit);
    if (page) query.skip(limit * (page - 1));

    const [users, total] = await query.getManyAndCount();

    // Chuyển đổi kết quả sang UserResponse
    const records = users.map((user) => new UserResponse(user));

    return { total, records };
  }

  async create(createUser: CreateUserRequest): Promise<void> {
    console.log(createUser);

    const isExistEmailOrUsername = await this.userRepository.findOne({
      where: [{ email: createUser.email }, { email: createUser.email }],
    });

    if (isExistEmailOrUsername) {
      throw new BadRequestException();
    }

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user: User = new User();
      user.email = createUser.email;
      user.date = createUser.date;

      user.password = await bcrypt.hash(createUser.password, SALT_ROUNDSS);
      await queryRunner.manager.save(user);
      await queryRunner.commitTransaction();
      await this.sentVerificationEmail(createUser.email);
    } catch (err) {
      await queryRunner.rollbackTransaction();

      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async find(email: string): Promise<UserResponse> {
    const user: User = await this.userRepository.findOneBy({ email });

    // Kiểm tra người dùng có tồn tại hay không ?
    if (!user) {
      throw new NotFoundException();
    }
    return new UserResponse(user);
  }

  async update(
    id: number,
    updateUser: UpdateUserRequest,
    img?: Express.Multer.File,
  ): Promise<UserResponse> {
    try {
      const user: User = await this.userRepository.findOneBy({
        user_id: id,
      });

      if (!user) {
        throw new NotFoundException();
      }

      const userToUpdate = { ...updateUser };

      const path = require('path');

      if (img) {
        try {
          const originalname = img.originalname;
          const avatarExtension = getFileExtension(originalname);

          // Sử dụng đường dẫn tương đối từ file hiện tại đến thư mục public/avatar
          const avatarDir = path.resolve(__dirname, '../../../public/avatar');
          const avatarFilename = `${user.user_id}.${avatarExtension}`;
          const avatarLocation = path.join(avatarDir, avatarFilename);

          if (!fs.existsSync(avatarDir)) {
            fs.mkdirSync(avatarDir, { recursive: true });
          }
          fs.writeFileSync(avatarLocation, img.buffer);
          userToUpdate.img = `avatar/${avatarFilename}`; // Lưu đường dẫn tương đối
        } catch (error) {
          console.error('Lỗi khi ghi file:', error);
        }
      } else {
        console.log('null image');
      }
      // Tạo một đối tượng để cập nhật

      if (updateUser.password) {
        userToUpdate.password = await bcrypt.hash(
          updateUser.password,
          SALT_ROUNDSS,
        );
      }

      // Tạo một đối tượng để cập nhật với chỉ những trường hợp lệ
      const updateObject = {};
      Object.keys(userToUpdate).forEach((key) => {
        if (userToUpdate[key] !== undefined) {
          updateObject[key] = userToUpdate[key];
        }
      });

      await this.userRepository.update({ user_id: id }, updateObject);

      await this.userRepository.update({ user_id: id }, userToUpdate);
      console.log('2-check', userToUpdate);

      return await this.find(user.email);
    } catch (error) {
      // Xử lý lỗi
      throw new InternalServerErrorException(error.message);
    }
  }

  async getCodeResetPass(email: string): Promise<void> {
    // Kiểm tra xem có người dùng với email này không
    const user = await this.userRepository.findOneBy({ email: email });
    if (!user) {
      throw new NotFoundException('Không có người dùng nào có email này.');
    }
    // Tạo mã reset mật khẩu ngẫu nhiên và mã hóa
    const randomCode = generateRandomCode(); // Bạn cần phải xác định phương thức này

    // Cập nhật mã reset mật khẩu cho người dùng
    await this.userRepository.update(
      { user_id: user.user_id },
      { code: randomCode },
    );

    // Gửi mã reset qua email (lấy phần trước của mã nếu cần)
    const codeToSend = randomCode.split('_')[0];

    let subject = 'Cozy - Mã đặt lại mật khẩu';
    let text = `Mã đặt lại mật khẩu: ${codeToSend}
 Lưu ý mã chỉ có hiệu lực trong vòng 5 phút.`;

    let text2 = `
 <p>Xin chào!</p>
 <p>Chúng tôi đã nhận được yêu cầu đặt lại mật khẩu của bạn.</p>
 <p>Mã đặt lại mật khẩu của bạn: <span> <a style="background-color: #008CBA; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 5px;">${codeToSend}</a>
 </span>
 <p>Lưu ý rằng mã chỉ có hiệu lực trong vòng 5 phút.</p>
 <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
`;
    await sendEmail(email, subject, text2); // Giả định rằng EmailService có phương thức sendEmail
  }

  async sentVerificationEmail(email: string): Promise<void> {
    // Kiểm tra xem có người dùng với email này không
    const user = await this.userRepository.findOneBy({ email: email });
    if (user && user.verifed == 1) {
      throw new NotFoundException('Người dùng đã xác minh email.');
    }

    // Tạo mã reset mật khẩu ngẫu nhiên và mã hóa
    const token = await this.jwtService.signAsync({
      email: user.email,
      // exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    });

    const verificationUrl = `http://localhost:9999/verify-email?token=${token}`;

    const buttonText = 'Xác minh email';

    let subject = 'Cozy - Xác thực email';
    let text = `
    <p>Cảm ơn bạn đã đăng ký thành viên trên cửa hàng của chúng tôi!</p>
    <p>Vui lòng nhấp vào nút bên dưới để xác minh email:</p>
    <button style="background-color: #008CBA; color: white; padding: 10px 20px; border: none; cursor: pointer;" onclick="window.location.href='${verificationUrl}'">${buttonText}</button>
    <hr>
    <p>Hoặc truy cập liên kết ${verificationUrl}</p>
    <p>Lưu ý email chỉ có hiệu lực trong vòng 24 giờ.</p>
  `;

    console.log('Xác thực email', verificationUrl);
    console.log('Gửi đi token', token);

    await sendEmail(email, subject, text);
  }

  async verificationEmail(token: string): Promise<string> {
    console.log('Xác minh token', token);

    try {
      const decoded = await this.jwtService.verifyAsync(token);
      console.log('Token xác minh được:', decoded);
      const user: User = await this.userRepository.findOneBy({
        email: decoded.email,
      });

      if (!user) {
        throw new NotFoundException();
      }

      await this.userRepository.update(
        { email: decoded.email },
        { ...user, verifed: 1 },
      );

      return decoded.email;
    } catch (error) {
      console.error('Lỗi xác minh:', error);

      // Xử lý lỗi token hết hạn hoặc không hợp lệ
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token đã hết hạn.');
      } else {
        throw new Error('Token không hợp lệ.');
      }
    }
  }
  
  // private sendEmail = (to, subject, text) => {
  //   const mailOptions = {
  //     from: 'COZYhandmade2032@outlook.com',
  //     to: to,
  //     subject: subject,
  //     text: text,
  //   };

  //   let transporter = nodemailer.createTransport({
  //     host: 'smtp-mail.outlook.com', // hostname
  //     secureConnection: false, // TLS requires secureConnection to be false
  //     port: 587, // port for secure SMTP
  //     service: 'Outlook365',
  //     auth: {
  //       user: 'COZYhandmade2032@outlook.com',
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

  private isCodeExpired = (codeLong, code) => {
    const parts = codeLong.split('_');

    const codeTime = parseInt(parts[1], 10);
    const currentTime = Date.now();

    if (currentTime - codeTime < 5 * 60 * 1000 && code == parts[0]) {
      return true;
    } else {
      return false;
    }
    // Kiểm tra xem thời gian có chênh lệch quá 5 phút hay không
  };

  async resetPass(updateUser): Promise<void> {
    // Kiểm tra xem có người dùng với email này không
    const user: User = await this.userRepository.findOneBy({
      email: updateUser.email,
    });

    if (!user) {
      throw new NotFoundException('Không có người dùng nào có email này.');
    }

    if (this.isCodeExpired(user.code, updateUser.code)) {
      // Cập nhật mật khẩu cho người dùng
      await this.userRepository.update(
        { user_id: user.user_id },
        { password: await bcrypt.hash(updateUser.password, SALT_ROUNDSS) },
      );
      return;
    }

    throw new NotFoundException('Mã xác thực không hợp lệ hoặc đã hết hạn.');
  }
}
