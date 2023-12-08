import { Injectable, UnauthorizedException } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { LoginResponse } from '../responses/login.response';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginRequest } from '../requests/login.request';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    let logginer = null;
    if (loginRequest.type == 'customer') {
      logginer = await this.userRepository.findOneBy({
        email: loginRequest.email,
      });
    }
    //   else if ((loginRequest.type == 'admin')){
    //      logginer = await this.adminRepository.findOneBy({
    //         email: loginRequest.email,}
    //     )}

    // Nếu không tìm thấy người dùng thì trả về lỗi
    if (!logginer) {
      throw new UnauthorizedException(
        'Email không tồn tại hoặc mật khẩu không chính xác.',
      );
    } else if (logginer.status == 0) {
      throw new HttpException(
        'Tài khoản bị vô hiệu hóa, vui lòng liên hệ với quản trị viên để biết thêm thông tin.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    // Kiểm tra mật khẩu, nếu không trùng khớp thì trả về lỗi
    const isMatch = await bcrypt.compare(
      loginRequest.password,
      logginer.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException(
        'Email không tồn tại hoặc mật khẩu không chính xác.',
      );
    }

    // Tạo ra token (sử dụng JWT)
    const payload = {
      sub: logginer.userId || logginer.adminId,
      email: logginer.email,
    };
    const token = await this.jwtService.signAsync(payload);

    const loginResponse = new LoginResponse();
    loginResponse.token = token;

    // Trả về token cho client
    return loginResponse;
  }
}
