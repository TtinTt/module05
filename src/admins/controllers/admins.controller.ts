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
import { CreateAdminRequest } from '../requests/create-admin.request';
import { AdminsService } from '../providers/admins.service';
// import { SearchAdminRequest } from '../requests/search-admin.request';
import { UpdateAdminRequest } from '../requests/update-admin.request';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { EmailInput } from '../requests/EmailInput.request';
import { resetPassAdminRequest } from '../requests/resetPass-admin.request';
import { SearchAdminRequest } from '../requests/search-admin.request';

@Controller('admins')
export class AdminsController {
  constructor(private adminsService: AdminsService) {}

  @Get()
  async index(
    @Req() request: Request,
    @Query() searchRequest: SearchAdminRequest,
  ) {
    console.log('searchRequest Admins', searchRequest);

    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    console.log('searchRequest Admins', isAdminSuper, admin);

    if (admin || isAdminSuper) {
      return await this.adminsService.search(
        searchRequest.name,
        searchRequest.page,
        searchRequest.limit,
        searchRequest.sortType,
      );
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestBody: UpdateAdminRequest,
    @Req() request: Request,
  ) {
    // Kiểm tra quyền truy cập
    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    const user = (request as any).user;
    console.log('Request Check isAdminSuper', isAdminSuper, admin, user);
    // console.log('RequestBody Check', requestBody);

    if (isAdminSuper) {
      // Admin với quyền cao nhất cập nhật thông tin của bất kỳ người dùng nào
      return await this.adminsService.update(id, requestBody);
    } else if (admin && admin.admin_id == id) {
      // Admin bình thường chỉ cập nhật thông tin của chính mình
      return await this.adminsService.update(id, requestBody);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }

  @Post()
  @HttpCode(201)
  async create(
    @Body() requestBody: CreateAdminRequest,
    @Req() request: Request,
  ) {
    const isAdminSuper = (request as any).isAdminSuper;
    if (isAdminSuper) {
      // Admin với quyền cao nhất cập nhật thông tin của bất kỳ người dùng nào
      return await this.adminsService.create(requestBody);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }
}
