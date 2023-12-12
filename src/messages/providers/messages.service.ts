import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Message } from '../entities/message.entity';

import { DataSource, ILike, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDSS } from 'src/common/constants';
import { getFileExtension } from 'src/utilities/upload.util';
import * as fs from 'fs';
import path from 'path';
// import { CreateMessageRequest } from '../requests/create-message.request';
import { MessageResponse } from '../responses/message.response';
import { CreateMessageRequest } from '../requests/create-message.request';
import { UpdateMessageRequest } from '../requests/update-messages.request';
import { SearchMessageRequest } from '../requests/search-messages.request';
// import { UpdateMessageRequest } from '../requests/update-message.request';

// Tài liệu: https://docs.nestjs.com/providers#services

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    private dataSource: DataSource,
  ) {}

  // async findMessageByEmail(email: string): Promise<MessageResponse[]> {
  //   // Truy vấn tất cả các đơn hàng có email khớp với email truyền vào
  //   const messages: Message[] = await this.messageRepository.find({
  //     where: { email: email },
  //     message: { id: 'DESC' },
  //   });
  //   return messages;
  // }

  async findMessageById(id: number): Promise<MessageResponse> {
    const message: Message = await this.messageRepository.findOneBy({ id });

    // Kiểm tra người dùng có tồn tại hay không ?
    if (!message) {
      throw new NotFoundException();
    }
    return new MessageResponse(message);
  }

  async create(createMessageDto: CreateMessageRequest): Promise<void> {
    // Tạo một instance mới của Message Entity
    const newMessage = new Message();

    // Gán dữ liệu từ DTO sang Entity
    newMessage.email = createMessageDto.email;
    newMessage.date = createMessageDto.date;
    newMessage.name = createMessageDto.name;
    newMessage.phone = createMessageDto.phone;
    newMessage.mess = createMessageDto.mess;
    newMessage.status = createMessageDto.status;

    try {
      // Lưu entity vào cơ sở dữ liệu
      const message = await this.messageRepository.save(newMessage);
    } catch (error) {
      throw error;
    }
  }

  async update(id: number, updateMessage: UpdateMessageRequest) {
    try {
      const message: Message = await this.messageRepository.findOneBy({
        id: id,
      });

      if (!message) {
        throw new NotFoundException();
      }
      // Tạo một đối tượng để cập nhật với chỉ những trường hợp lệ
      const updateObject = { status: updateMessage.status };
      await this.messageRepository.update({ id: id }, updateObject);
      console.log('check update message', updateObject);
    } catch (error) {
      // Xử lý lỗi
      throw new InternalServerErrorException(error.message);
    }
  }

  async search(
    request: SearchMessageRequest,
  ): Promise<{ total: number; records: MessageResponse[] }> {
    const query = this.messageRepository.createQueryBuilder('message');

    // Tìm kiếm theo tên, email hoặc số điện thoại
    if (request.name) {
      const name = `%${request.name}%`.toLowerCase();
      query.andWhere(
        `(
          LOWER(message.email) LIKE :name OR
          LOWER(message.name) LIKE :name OR
          LOWER(message.phone) LIKE :name
        )`,
        { name },
      );
    }

    // Lọc theo sortType
    switch (request.sortType) {
      case 1:
        query.andWhere('message.status = :status', { status: 1 });
        break;
      case 0:
        query.andWhere('message.status = :status', { status: 0 });
        break;
      default:
        // sortType mặc định là 2 - sắp xếp theo id giảm dần
        query.orderBy('message.id', 'DESC');
    }

    // Phân trang
    query.take(request.limit);
    if (request.page) query.skip(request.limit * (request.page - 1));

    const [messages, total] = await query.getManyAndCount();

    // Chuyển đổi kết quả sang MessageResponse
    const records = messages.map((message) => new MessageResponse(message));

    return { total, records };
  }
}
