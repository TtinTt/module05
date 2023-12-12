import {
  Injectable,
  UnauthorizedException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Admin } from 'src/admins/entities/admin.entity';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginRequest } from '../requests/login.request';
import { LoginResponse } from '../responses/login.response';
import { JWT_SECRET } from 'src/common/constants';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Admin)
    private adminRepository: Repository<Admin>,
    private jwtService: JwtService,
  ) {}

  async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    let entity;
    if (loginRequest.type === 'customer') {
      entity = await this.userRepository.findOneBy({
        email: loginRequest.email,
      });
    } else if (loginRequest.type === 'admin') {
      entity = await this.adminRepository.findOneBy({
        email: loginRequest.email,
      });
    }

    if (!entity) {
      throw new UnauthorizedException(
        'Email không tồn tại hoặc mật khẩu không chính xác.',
      );
    }

    if (entity.status === 0) {
      throw new HttpException(
        'Tài khoản bị vô hiệu hóa, vui lòng liên hệ với quản trị viên.',
        HttpStatus.NOT_ACCEPTABLE,
      );
    }

    const isMatch = await bcrypt.compare(
      loginRequest.password,
      entity.password,
    );
    if (!isMatch) {
      throw new UnauthorizedException(
        'Email không tồn tại hoặc mật khẩu không chính xác.',
      );
    }
    let payload;
    if (loginRequest.type === 'admin') {
      payload = {
        sub: entity.id,
        admin_id: entity.admin_id,
        email: entity.email,
        type: entity.type,
        status: entity.status,
        // exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      };
      const token = await this.jwtService.signAsync(payload);

      return { token };
    } else if (loginRequest.type === 'customer') {
      payload = {
        sub: entity.id,
        user_id: entity.user_id,
        email: entity.email,
        type: entity.type,
        status: entity.status,
        verifed: entity.verifed,
        // exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      };
      const token = await this.jwtService.signAsync(payload);

      return { token };
    }
  }

  async validateToken(
    token: string,
    type: 'user' | 'admin',
  ): Promise<User | Admin> {
    try {
      const decoded = this.jwtService.verify(token, { secret: JWT_SECRET });
      // console.log('decoded', decoded);

      if (type === 'user') {
        return await this.userRepository.findOneBy({
          email: decoded.email,
        });
      } else if (type === 'admin') {
        return await this.adminRepository.findOneBy({ email: decoded.email });
      }
    } catch (error) {
      throw new UnauthorizedException('Token không hợp lệ hoặc đã hết hạn.');
    }
  }
}
