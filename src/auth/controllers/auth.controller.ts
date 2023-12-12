import {
  Body,
  Controller,
  Post,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../providers/auth.service';
import { LoginRequest } from '../requests/login.request';
import { LoginResponse } from '../responses/login.response';
import { Public } from '../decorators/auth.decorator';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/login')
  async login(@Body() requestBody: LoginRequest): Promise<LoginResponse> {
    return this.authService.login(requestBody);
  }

  @Public()
  @Get('/auth')
  async auth(
    @Headers('userToken') userToken?: string,
    @Headers('adminToken') adminToken?: string,
  ): Promise<any> {
    if (!userToken && !adminToken) {
      throw new UnauthorizedException('Không có token nào được cung cấp.');
    }

    let user, admin, userResult, adminResult;

    if (userToken) {
      try {
        userResult = await this.authService.validateToken(userToken, 'user');
        if (userResult) {
          user = { ...userResult };
          delete user.password;
          delete user.code;
        }
      } catch (e) {
        throw new UnauthorizedException('Token người dùng không hợp lệ.');
      }
    }

    if (adminToken) {
      try {
        adminResult = await this.authService.validateToken(adminToken, 'admin');
        if (adminResult) {
          admin = { ...adminResult };
          delete admin.password;
          delete admin.code;
        }
      } catch (e) {
        throw new UnauthorizedException('Token quản trị viên không hợp lệ.');
      }
    }

    return { user, admin };
  }
}
