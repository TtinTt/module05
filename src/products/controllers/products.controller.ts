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
import { ProductsService } from '../providers/products.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Public } from 'src/auth/decorators/auth.decorator';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { SearchProductRequest } from '../requests/search-product.request';
import { UpdateProductRequest } from '../requests/update-product.request';
import { CreateProductRequest } from '../requests/create-product.request';

// import { CreateProductRequest } from '../requests/create-product.request';
// import { UpdateProductRequest } from '../requests/update-product.request';

@Controller('products')
export class ProductsController {
  constructor(private productsService: ProductsService) {}

  @Public()
  @Get()
  async index(@Query() searchRequest: SearchProductRequest) {
    console.log('searchRequest Product', searchRequest);

    return await this.productsService.search(
      searchRequest.name,
      searchRequest.page,
      searchRequest.limit,
      searchRequest.maxPrice,
      searchRequest.sortType,
      searchRequest.category,
    );
  }

  @Public()
  @Get('tag')
  async getTag() {
    return await this.productsService.getTag();
  }

  @Public()
  @Get('price')
  async getPrice() {
    return await this.productsService.getPrice();
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imgFile0', maxCount: 1 },
      { name: 'imgFile1', maxCount: 1 },
      { name: 'imgFile2', maxCount: 1 },
      { name: 'imgFile3', maxCount: 1 },
      { name: 'imgFile4', maxCount: 1 },
      { name: 'imgFile5', maxCount: 1 },
      { name: 'imgFile6', maxCount: 1 },
      { name: 'imgFile7', maxCount: 1 },
      { name: 'imgFile8', maxCount: 1 },
      { name: 'imgFile9', maxCount: 1 },
      { name: 'imgFile10', maxCount: 1 },
    ]),
  )
  async addProduct(
    @Req() request: Request,
    @Body() productData: CreateProductRequest,
    @UploadedFiles() files: { [key: string]: Express.Multer.File[] },
  ): Promise<void> {
    // Kiểm tra quyền truy cập

    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    const product = (request as any).product;
    console.log('Request Check', isAdminSuper, admin, product);

    if (admin | isAdminSuper) {
      // Admin
      await this.productsService.create(productData, files);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }

  @Put('/:id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'imgFile0', maxCount: 1 },
      { name: 'imgFile1', maxCount: 1 },
      { name: 'imgFile2', maxCount: 1 },
      { name: 'imgFile3', maxCount: 1 },
      { name: 'imgFile4', maxCount: 1 },
      { name: 'imgFile5', maxCount: 1 },
      { name: 'imgFile6', maxCount: 1 },
      { name: 'imgFile7', maxCount: 1 },
      { name: 'imgFile8', maxCount: 1 },
      { name: 'imgFile9', maxCount: 1 },
      { name: 'imgFile10', maxCount: 1 },
    ]),
  )
  async updateProduct(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductData: UpdateProductRequest,
    @UploadedFiles() files: { [key: string]: Express.Multer.File[] },
  ): Promise<void> {
    // Kiểm tra quyền truy cập

    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    const product = (request as any).product;
    console.log('Request Check', isAdminSuper, admin, product);

    if (admin | isAdminSuper) {
      // Admin
      await this.productsService.update(id, updateProductData, files);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }

  // @Put('/:id')
  // @UseInterceptors(
  //   FileFieldsInterceptor([
  //     { name: 'img', maxCount: 1 },
  //     // Thêm các field khác nếu cần
  //   ]),
  // )

  // @UseInterceptors(FileInterceptor('img'))
  // async update(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() requestBody: UpdateProductRequest,
  //   @UploadedFile() img: Express.Multer.File,
  //   @Req() request: Request,
  // ) {
  //   // Kiểm tra quyền truy cập

  //   const isAdminSuper = (request as any).isAdminSuper;
  //   const admin = (request as any).admin;
  //   const product = (request as any).product;
  //   console.log('Request Check', isAdminSuper, admin, product);
  //   // console.log('RequestBody Check', requestBody);
  //   console.log('Files Check:', img);

  //   if (product && product.product_id == id) {
  //     // Người dùng thông thường cập nhật thông tin của chính mình
  //     return await this.productsService.update(id, requestBody, img);
  //   } else if (isAdminSuper) {
  //     // Admin với quyền cao nhất cập nhật thông tin của bất kỳ người dùng nào
  //     return await this.productsService.update(id, requestBody, img);
  //   } else if (admin && admin.admin_id == id) {
  //     // Admin bình thường chỉ cập nhật thông tin của chính mình
  //     return await this.productsService.update(id, requestBody, img);
  //   } else {
  //     throw new UnauthorizedException(
  //       'Bạn không có quyền thực hiện hành động này.',
  //     );
  //   }}

  // @Post()
  // @HttpCode(201)
  // //   @UseInterceptors(FileInterceptor('avatar'))
  // async create(
  //   @Body() requestBody: CreateProductRequest,
  //   // @UploadedFile() avatar: Express.Multer.File,
  // ) {
  //   await this.productsService.create(
  //     requestBody,
  //     // ,         avatar
  //   );
  // }

  //   @Get('/:id')
  //   async show(@Param('id', ParseIntPipe) id: number) {
  //     return await this.productsService.find(id);
  //   }

  //   @Put('/:id')
  //   @UseInterceptors(
  //     FileFieldsInterceptor([
  //       { name: 'avatar', maxCount: 1 },
  //       { name: 'images', maxCount: 3 },
  //     ]),
  //   )

  @Delete('/:id')
  @HttpCode(204)
  async destroy(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    // Kiểm tra quyền truy cập

    const isAdminSuper = (request as any).isAdminSuper;
    const admin = (request as any).admin;
    const product = (request as any).product;
    console.log('Request Check', isAdminSuper, admin, product);

    if (admin | isAdminSuper) {
      // Admin bình thường chỉ cập nhật thông tin của chính mình
      await this.productsService.delete(id);
    } else {
      throw new UnauthorizedException(
        'Bạn không có quyền thực hiện hành động này.',
      );
    }
  }
}
