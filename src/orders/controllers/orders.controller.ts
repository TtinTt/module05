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
import { OrdersService } from '../providers/orders.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { CreateOrderRequest } from '../requests/create-order.request';
import { UpdateOrderRequest } from '../requests/update-order.request';
import { Order } from '../entities/order.entity';
import { getDaysDifference } from 'src/common/function';
import { SearchOrderRequest } from '../requests/search-order.request';
// import { SearchOrderRequest } from '../requests/search-order.request';

// import { CreateOrderRequest } from '../requests/create-order.request';
// import { UpdateOrderRequest } from '../requests/update-order.request';

@Controller('orders')
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Get('/:email')
  async show(@Param('email') email: string) {
    return await this.ordersService.findOrderByEmail(email);
  }

  @Post()
  @HttpCode(201)
  async create(
    @Req() request: Request,
    @Body() requestBody: CreateOrderRequest,
  ) {
    const user = (request as any).user;
    console.log('check verifed email', user.verifed);

    if (user.verifed == 1) {
      await this.ordersService.create(requestBody);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }

  @Put('/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() requestBody: UpdateOrderRequest,
    @Req() request: Request,
  ) {
    // Kiểm tra quyền truy cập
    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    const user = (request as any).user;

    console.log('Request Check', isAdminSuper, admin, user);
    // console.log('RequestBody Check', requestBody);
    const order: Order = await this.ordersService.findOrderById(id);
    let isOverThan4Hour = getDaysDifference(order.date) > 4;
    console.log('getDaysDifference(order.date)', getDaysDifference(order.date));

    if (user && user.email == order.email && !isOverThan4Hour) {
      // Người dùng thông thường cập nhật trước 4 giờ
      return await this.ordersService.update(id, requestBody);
    } else if ((admin || isAdminSuper) && isOverThan4Hour) {
      // Admin cập nhật sau 4 giờ
      return await this.ordersService.update(id, requestBody);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này vào lúc này.',
      );
    }

    //   @Delete('/:id')
    //   @HttpCode(204)
    //   async destroy(@Param('id', ParseIntPipe) id: number) {
    //     await this.usersService.delete(id);
    //   }
  }

  // @Public()
  @Get()
  async index(
    @Query() searchRequest: SearchOrderRequest,
    @Req() request: Request,
  ) {
    console.log('searchRequest Product', searchRequest);
    // Kiểm tra quyền truy cập
    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;

    if (admin || isAdminSuper) {
      return await this.ordersService.search(
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

    // return await this.ordersService.search(
    //   searchRequest.name,
    //   searchRequest.page,
    //   searchRequest.limit,
    //   searchRequest.sortType,
    // );
  }
}
