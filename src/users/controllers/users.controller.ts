import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { CreateUserRequest } from '../requests/create-user.request';

@Controller('users')
export class UsersController {
    @Get()
    index(
        @Query('keyword') keyword: string,
        @Query('page', ParseIntPipe) page: number,
        @Query('limit', ParseIntPipe) limit: number
    ) {
        return {
            keyword: keyword,
            page: page,
            limit: limit,
        };
    }

    @Post()
    create(@Body() requestBody: CreateUserRequest) {
        return {
            requestBody: requestBody
        }
    }

    @Get('/:id')
    show(@Param('id', ParseIntPipe) id: number) {
        return {
            id: id
        }
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
