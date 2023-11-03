import { Controller, Get, Post, Put, Delete, Query, Body, Param } from '@nestjs/common';

@Controller('user')
export class UserController {
    @Get()
    index(@Query() query) {
        return {
            query: query
        };
    }

    @Post()
    create(@Body() body) {
        return {
            body: body
        };
    }

    @Get('/:id')
    show(@Param('id') id) {
        return {
            id: id
        };
    }

    @Put('/:id')
    update(@Param('id') id: number, @Body() body) {
        return {
            id: id,
            body: body
        };
    }

    @Delete('/:id')
    delete(@Param('id') id: number) {
        return {
            id: id
        };
    }
}
