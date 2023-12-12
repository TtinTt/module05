import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UnauthorizedException,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateUserRequest } from '../requests/create-user.request';
import { UsersService } from '../providers/users.service';
import { SearchUserRequest } from '../requests/search-user.request';
import { UpdateUserRequest } from '../requests/update-user.request';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { EmailInput } from '../requests/EmailInput.request';
import { resetPassUserRequest } from '../requests/resetPass-user.request';
import { verify } from 'crypto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // @Public()
  @Get()
  async index(@Query() searchRequest: SearchUserRequest) {
    console.log('searchRequest ', searchRequest);

    return await this.usersService.search(
      searchRequest.name,
      searchRequest.page,
      searchRequest.limit,
      searchRequest.sortType,
    );
  }

  @Public()
  @Post()
  @HttpCode(201)
  async create(@Body() requestBody: CreateUserRequest) {
    await this.usersService.create(requestBody);
  }

  @Put('/verify-email/')
  async verify(@Body() requestBody: EmailInput) {
    console.log(requestBody.email);
    await this.usersService.sentVerificationEmail(requestBody.email);
  }

  @Public()
  @Put('/verify-token/')
  async verified(@Body() requestBody: { token: string }) {
    console.log(requestBody.token);
    await this.usersService.verificationEmail(requestBody.token);
  }

  @Public()
  @Put('/getcode')
  async getCodeResetPass(@Body() requestBody: EmailInput) {
    await this.usersService.getCodeResetPass(requestBody.email);
  }

  @Public()
  @Put('/resetpass')
  async resetPass(@Body() requestBody: resetPassUserRequest) {
    await this.usersService.resetPass(requestBody);
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('img'))
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestBody: UpdateUserRequest,
    @UploadedFile() img: Express.Multer.File,
    @Req() request: Request,
  ) {
    // Kiểm tra quyền truy cập
    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    const user = (request as any).user;
    console.log('Request Check', isAdminSuper, admin, user);
    // console.log('RequestBody Check', requestBody);
    console.log('Files Check:', img);

    if (user && user.user_id == id) {
      // Người dùng thông thường cập nhật thông tin của chính mình
      return await this.usersService.update(id, requestBody, img);
    } else if (isAdminSuper || admin) {
      // Admin được cập nhật thông tin của bất kỳ người dùng nào
      return await this.usersService.update(id, requestBody, img);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }
}
