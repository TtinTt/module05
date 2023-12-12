import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Order } from '../entities/order.entity';

import { DataSource, ILike, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDSS } from 'src/common/constants';
import { getFileExtension } from 'src/utilities/upload.util';
import * as fs from 'fs';
import path from 'path';
// import { CreateOrderRequest } from '../requests/create-order.request';
import { OrderResponse } from '../responses/order.response';
import { CreateOrderRequest } from '../requests/create-order.request';
import { UpdateOrderRequest } from '../requests/update-order.request';
// import { UpdateOrderRequest } from '../requests/update-order.request';

// Tài liệu: https://docs.nestjs.com/providers#services

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,

    private dataSource: DataSource,
  ) {}

  async findOrderByEmail(email: string): Promise<OrderResponse[]> {
    // Truy vấn tất cả các đơn hàng có email khớp với email truyền vào
    const orders: Order[] = await this.orderRepository.find({
      where: { email: email },
      order: { id: 'DESC' },
    });
    return orders;
  }

  async findOrderById(id: number): Promise<OrderResponse> {
    const order: Order = await this.orderRepository.findOneBy({ id });

    // Kiểm tra người dùng có tồn tại hay không ?
    if (!order) {
      throw new NotFoundException();
    }
    return new OrderResponse(order);
  }

  async create(createOrderDto: CreateOrderRequest): Promise<void> {
    // Tạo một instance mới của Order Entity
    const newOrder = new Order();

    // Gán dữ liệu từ DTO sang Entity
    newOrder.email = createOrderDto.email;
    // Chuyển đổi cart và address từ object thành chuỗi JSON để lưu vào cột JSON của database
    newOrder.cart = JSON.stringify(createOrderDto.cart);
    newOrder.address = JSON.stringify(createOrderDto.address);
    newOrder.date = createOrderDto.date;

    try {
      // Lưu entity vào cơ sở dữ liệu
      const order = await this.orderRepository.save(newOrder);

      // Trả về đối tượng Order đã lưu
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateOrder: UpdateOrderRequest) {
    try {
      const order: Order = await this.orderRepository.findOneBy({ id: id });

      if (!order) {
        throw new NotFoundException();
      }
      // Tạo một đối tượng để cập nhật với chỉ những trường hợp lệ
      const updateObject = { status: updateOrder.status };
      await this.orderRepository.update({ id: id }, updateObject);
      console.log('2-check', updateObject);
    } catch (error) {
      // Xử lý lỗi
      throw new InternalServerErrorException(error.message);
    }
  }

  async search(
    name: string,
    page: number,
    limit: number,
    sortType: number,
  ): Promise<{ total: number; records: OrderResponse[] }> {
    const query = this.orderRepository.createQueryBuilder('order');

    // Tìm kiếm theo email, tên hoặc số điện thoại trong địa chỉ
    if (name) {
      name = `%${name}%`.toLowerCase();
      query.andWhere(
        `(
          LOWER(order.email) LIKE :name OR
          LOWER(JSON_UNQUOTE(JSON_EXTRACT(order.address_json, '$.name'))) LIKE :name OR
          LOWER(JSON_UNQUOTE(JSON_EXTRACT(order.address_json, '$.phoneNumber'))) LIKE :name
        )`,
        { name },
      );
    }

    // Lọc theo sortType
    if (sortType === 1) {
      query.andWhere('order.status IN (:...statuses)', {
        statuses: [0, 1, 2, 4],
      });
    } else if (sortType === 2) {
      query.andWhere('order.status IN (:...statuses)', {
        statuses: [-1, -2, 3, 5],
      });
    }

    // Phân trang
    query.take(limit);
    if (page) query.skip(limit * (page - 1));

    const [orders, total] = await query.getManyAndCount();

    // Chuyển đổi kết quả sang OrderResponse
    const records = orders.map((order) => new OrderResponse(order));

    return { total, records };
  }
}
