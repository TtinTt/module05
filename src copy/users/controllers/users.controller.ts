import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateUserRequest } from '../requests/create-user.request';
import { UsersService } from '../providers/users.service';
import { SearchUserRequest } from '../requests/search-user.request';
import { UpdateUserRequest } from '../requests/update-user.request';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    index(@Query() searchRequest: SearchUserRequest) {
        return this.usersService.search(searchRequest.keyword, searchRequest.page, searchRequest.limit);
    }

    @Post()
    @HttpCode(201)
    create(@Body() requestBody: CreateUserRequest) {
        this.usersService.create(requestBody);
    }

    @Get('/:id')
    show(@Param('id', ParseIntPipe) id: number) {
        return this.usersService.find(id);
    }

    @Put('/:id')
    update(@Param('id', ParseIntPipe) id: number, @Body() requestBody: UpdateUserRequest) {
        return this.usersService.update(id, requestBody);
    }

    @Delete('/:id')
    @HttpCode(204)
    destroy(@Param('id', ParseIntPipe) id: number) {
        this.usersService.delete(id);
    }
}
