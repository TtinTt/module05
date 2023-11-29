import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Post, Put, Query, UploadedFile, UploadedFiles, UseGuards, UseInterceptors } from '@nestjs/common';
import { CreateUserRequest } from '../requests/create-user.request';
import { UsersService } from '../providers/users.service';
import { SearchUserRequest } from '../requests/search-user.request';
import { UpdateUserRequest } from '../requests/update-user.request';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    async index(@Query() searchRequest: SearchUserRequest) {
        return await this.usersService.search(searchRequest.keyword, searchRequest.page, searchRequest.limit);
    }

    @Public()
    @Post()
    @HttpCode(201)
    @UseInterceptors(FileInterceptor('avatar'))
    async create(
        @Body() requestBody: CreateUserRequest,
        @UploadedFile() avatar: Express.Multer.File,

    ) {
        await this.usersService.create(requestBody, avatar);
    }

    @Get('/:id')
    async show(@Param('id', ParseIntPipe) id: number) {
        return await this.usersService.find(id);
    }

    @Put('/:id')
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'avatar', maxCount: 1 },
            { name: 'images', maxCount: 3 },
        ])
    )
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() requestBody: UpdateUserRequest,
        @UploadedFiles() files: { avatar?: Express.Multer.File[], images?: Express.Multer.File[] }
    ) {
        console.log('avatar', files.avatar[0])
        console.log('images', files.images)

        return await this.usersService.update(id, requestBody);
    }

    @Delete('/:id')
    @HttpCode(204)
    async destroy(@Param('id', ParseIntPipe) id: number) {
        await this.usersService.delete(id);
    }
}
