import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';

@Controller('users')
export class UsersController {
    @Get()
    index(
        @Query('keyword') keyword: string,
        @Query('page') page: number,
        @Query('limit') limit: number
    ) {
        return {
            keyword: keyword,
            page: page,
            limit: limit,
        };
    }

    @Post()
    create(@Body() requestBody: object) {
        return {
            requestBody: requestBody
        }
    }

    @Get('/:id')
    show(@Param('id') id: number) {
        return {
            id: id
        }
    }

    @Put('/:id')
    update(@Param('id') id: number, @Body() requestBody: object) {
        return {
            id: id,
            requestBody: requestBody
        }
    }

    @Delete('/:id')
    destroy(@Param('id') id: number) {
        return {
            id: id
        }
    }
}
