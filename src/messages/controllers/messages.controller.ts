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
import { MessagesService } from '../providers/messages.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { CreateMessageRequest } from '../requests/create-message.request';
import { UpdateMessageRequest } from '../requests/update-messages.request';
import { Message } from '../entities/message.entity';
import { getDaysDifference } from 'src/common/function';
import { SearchMessageRequest } from '../requests/search-messages.request';

// import { CreateMessageRequest } from '../requests/create-message.request';
// import { UpdateMessageRequest } from '../requests/update-message.request';

@Controller('messs')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  // @Get('/:email')
  // async show(@Param('email') email: string) {
  //   return await this.messagesService.findMessageByEmail(email);
  // }

  @Post()
  @Public()
  @HttpCode(201)
  async create(@Body() requestBody: CreateMessageRequest) {
    await this.messagesService.create(requestBody);
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestBody: UpdateMessageRequest,
    @Req() request: Request,
  ) {
    // Kiểm tra quyền truy cập
    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    const user = (request as any).user;

    console.log('Request Check', isAdminSuper, admin);

    if (admin || isAdminSuper) {
      return await this.messagesService.update(id, requestBody);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }

  // @Public()
  @Get()
  async index(
    @Req() request: Request,
    @Query() searchRequest: SearchMessageRequest,
  ) {
    console.log('searchRequest Message', searchRequest);
    // Kiểm tra quyền truy cập
    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;

    if (admin || isAdminSuper) {
      return await this.messagesService.search(searchRequest);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }
}
