import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateUserRequest } from '../requests/create-user.request';
import { UsersService } from '../providers/users.service';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    index(
        @Query('keyword') keyword?: string,
        @Query('page', new ParseIntPipe({ optional: true })) page?: number,
        @Query('limit', new ParseIntPipe({ optional: true })) limit?: number
    ) {
        return this.usersService.search(keyword, page, limit);
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
    update(@Param('id', ParseIntPipe) id: number, @Body() requestBody: object) {
        return {
            id: id,
            requestBody: requestBody
        }
    }

    @Delete('/:id')
    destroy(@Param('id', ParseIntPipe) id: number) {
        return {
            id: id
        }
    }
}
