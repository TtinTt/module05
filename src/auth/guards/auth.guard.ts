import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JWT_SECRET } from 'src/common/constants';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // console.log('Kiểm tra request:', request);

    const userToken = request.headers.usertoken;
    const adminToken = request.headers.admintoken;
    console.log('userToken', userToken);
    console.log('adminToken', adminToken);

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    if (userToken) {
      const userPayload = await this.validateToken(userToken, 'user');
      if (userPayload) {
        request.user = userPayload;
        // console.log(request);

        return true;
      }
    }

    if (adminToken) {
      const adminPayload = await this.validateToken(adminToken, 'admin');
      if (adminPayload) {
        console.log('adminPayload', adminPayload);

        request.admin = adminPayload;
        request.isAdminSuper = adminPayload.admin_id == 1;
        console.log(request);

        return true;
      }
    }

    throw new UnauthorizedException();
  }

  private async validateToken(
    token: string,
    type: 'user' | 'admin',
  ): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, { secret: JWT_SECRET });
    } catch (error) {
      console.error('Token validation error:', error);
      return null;
    }
  }
}
