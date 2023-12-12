import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Product } from '../entities/product.entity';
import { ProductTag } from '../entities/product-tag.entity';
import { ProductImage } from '../entities/product-image.entity';
import { DataSource, ILike, LessThan, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDSS } from 'src/common/constants';
import { getFileExtension } from 'src/utilities/upload.util';
import * as fs from 'fs';
import path from 'path';
// import { CreateProductRequest } from '../requests/create-product.request';
import { ProductResponse } from '../responses/product.response';
import { UpdateProductRequest } from '../requests/update-product.request';
import { CreateProductRequest } from '../requests/create-product.request';
// import { UpdateProductRequest } from '../requests/update-product.request';

// Tài liệu: https://docs.nestjs.com/providers#services

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductTag)
    private productTagRepository: Repository<ProductTag>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,

    private dataSource: DataSource,
  ) {}

  async search(
    name?: string,
    page?: number,
    limit?: number,
    maxPrice?: number,
    sortType?: number,
    category?: string,
  ): Promise<{ total: number; records: ProductResponse[] }> {
    const query = this.productRepository.createQueryBuilder('product');

    query
      .leftJoinAndMapMany(
        'product.tag',
        ProductTag,
        'searchTag',
        'searchTag.product_id = product.product_id',
      )
      .leftJoinAndMapMany(
        'product.images',
        ProductImage,
        'image',
        'image.product_id = product.product_id',
      );

    // Tìm kiếm theo tên sản phẩm
    if (name) {
      query.andWhere(
        '(product.name LIKE :name OR product.sku LIKE :name OR searchTag.tag LIKE :name)',
        { name: `%${name}%` },
      );
    }

    // Lọc theo giá
    if (maxPrice && maxPrice > 0) {
      query.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    // Sắp xếp
    switch (sortType) {
      case 1:
        query.orderBy('product.price', 'DESC');
        break;
      case 2:
        query.orderBy('product.price', 'ASC');
        break;
      default:
        query.orderBy('product.product_id', 'DESC');
    }

    // Lọc theo tag
    if (category) {
      query.innerJoinAndSelect('product.tag', 'tag', 'tag.tag = :category', {
        category,
      });
    }

    // Phân trang
    if (limit) {
      query.take(limit);
      if (page) query.skip(limit * (page - 1));
    }

    let result = await query.getManyAndCount();

    // Chỉnh sửa kết quả trả về để đảm bảo đúng định dạng mong muốn
    let records = result[0].map((product) => ({
      ...product,
      tag: product.tag.map((tag) => tag.tag),
      img: product.images.map((image) => image.image_url),
    }));

    return { total: result[1], records };
  }

  async create(
    productData: CreateProductRequest,
    files: { [key: string]: Express.Multer.File[] },
  ): Promise<void> {
    const newProduct = this.productRepository.create({
      name: productData.name,
      price: productData.price,
      comparative: productData.comparative,
      sku: productData.sku,
      description: productData.description,
    });
    await this.productRepository.save(newProduct);

    const imgUrls = this.extractImgUrls(productData);
    const processedImgFiles = await this.processImageFiles(
      newProduct.product_id,
      Object.values(files).flat(),
    );

    const mergedImages = this.mergeAndSortImages(processedImgFiles, imgUrls);

    for (const imageUrl of mergedImages) {
      const newImage = this.productImageRepository.create({
        product_id: newProduct.product_id,
        image_url: imageUrl,
      });
      await this.productImageRepository.save(newImage);
    }

    if (productData.tag) {
      const tags = productData.tag.split(',');
      await this.handleProductTags(newProduct.product_id, tags);
    }
  }

  private async processImageFiles(
    productId: number,
    imgFiles: Express.Multer.File[],
  ): Promise<string[]> {
    const processedImgFiles = [];
    for (const file of imgFiles) {
      const path = require('path');
      const imgFilesExtension = getFileExtension(file.originalname);
      let indexImg = file.fieldname.slice(-1);

      const filename = `${productId}-${indexImg}.${imgFilesExtension}`;
      const filePath = path.join(__dirname, '../../../public/images', filename);

      fs.writeFileSync(filePath, file.buffer);

      processedImgFiles.push(`images/${filename}`);
    }
    return processedImgFiles;
  }

  private mergeAndSortImages(processedImgFiles, imgUrls) {
    let result = [];
    let fileOrderMap = {};

    processedImgFiles.forEach((filePath) => {
      const match = filePath.match(/-(\d+)\./);
      if (match) {
        const index = parseInt(match[1], 10);
        fileOrderMap[index] = filePath;
      }
    });

    let maxIndex = Math.max(
      ...Object.keys(fileOrderMap).map(Number),
      imgUrls.length + Object.keys(fileOrderMap).length - 1,
    );

    let urlIndex = 0;

    for (let i = 0; i <= maxIndex; i++) {
      if (fileOrderMap.hasOwnProperty(i)) {
        result[i] = fileOrderMap[i];
      } else {
        if (urlIndex < imgUrls.length) {
          result[i] = imgUrls[urlIndex];
          urlIndex++;
        }
      }
    }

    return result;
  }
  private extractImgUrls(
    productData: CreateProductRequest | UpdateProductRequest,
  ): string[] {
    const imgUrls: string[] = [];
    for (let i = 0; i <= 9; i++) {
      const imgUrl = productData[`imgUrl${i}`];
      if (imgUrl) {
        imgUrls.push(imgUrl);
      }
    }
    return imgUrls;
  }

  private async handleProductTags(
    productId: number,
    tags: string[],
  ): Promise<void> {
    for (const tag of tags) {
      const newTag = this.productTagRepository.create({
        product_id: productId,
        tag: tag,
      });
      await this.productTagRepository.save(newTag);
    }
  }

  async update(
    id: number,
    updateProduct: UpdateProductRequest,
    files: { [key: string]: Express.Multer.File[] },
  ): Promise<void> {
    const product = await this.productRepository.findOneBy({ product_id: id });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    const updateProductData = this.productRepository.create({
      name: updateProduct.name,
      price: updateProduct.price,
      comparative: updateProduct.comparative,
      sku: updateProduct.sku,
      description: updateProduct.description,
    });

    // Cập nhật thông tin sản phẩm
    this.productRepository.merge(product, updateProductData);
    await this.productRepository.save(product);

    // Xử lý và lưu hình ảnh
    const imgUrls = this.extractImgUrls(updateProduct);

    const processedImgFiles = await this.processImageFiles(
      product.product_id,
      Object.values(files).flat(),
    );

    const mergedImages = this.mergeAndSortImages(processedImgFiles, imgUrls);

    // Xóa hình ảnh cũ và thêm hình ảnh mới
    await this.productImageRepository.delete({ product_id: id });
    for (const imageUrl of mergedImages) {
      const newImage = this.productImageRepository.create({
        product_id: product.product_id,
        image_url: imageUrl,
      });
      await this.productImageRepository.save(newImage);
    }

    // Xóa tag cũ và thêm tag mới
    await this.productTagRepository.delete({ product_id: id });

    // Chỉ xử lý tag nếu có
    if (updateProduct.tag && updateProduct.tag.trim() !== '') {
      const tags = updateProduct.tag.split(',');
      await this.handleProductTags(id, tags);
    }
  }

  async getTag(): Promise<{ tags: string[] }> {
    // Truy vấn để lấy tag có tag_id nhỏ nhất cho mỗi sản phẩm
    const subQuery = this.productTagRepository
      .createQueryBuilder('tag')
      .select('MIN(tag.tag_id)', 'minTagId')
      .groupBy('tag.product_id');

    const query = this.productTagRepository
      .createQueryBuilder('tag')
      .select('tag.tag', 'tag')
      .innerJoin(
        `(${subQuery.getQuery()})`,
        'minTag',
        'tag.tag_id = minTag.minTagId',
      );

    const result = await query.getRawMany();

    // Lấy ra các tag duy nhất
    const uniqueTags = Array.from(new Set(result.map((item) => item.tag)));

    return { tags: uniqueTags };
  }

  async getPrice(): Promise<{
    total: number;
    maxPrice: number;
    minPrice: number;
  }> {
    const total = await this.productRepository.count();

    const maxPriceResult = await this.productRepository
      .createQueryBuilder('product')
      .select('MAX(product.price)', 'maxPrice')
      .getRawOne();

    const minPriceResult = await this.productRepository
      .createQueryBuilder('product')
      .select('MIN(product.price)', 'minPrice')
      .getRawOne();

    return await {
      total: total,
      maxPrice: maxPriceResult.maxPrice,
      minPrice: minPriceResult.minPrice,
    };
  }

  // async update(
  //   id: number,
  //   updateProduct: UpdateProductRequest,
  //   img?: Express.Multer.File,
  // ): Promise<ProductResponse> {
  //   try {
  //     const product: Product = await this.productRepository.findOneBy({
  //       product_id: id,
  //     });

  //     if (!product) {
  //       throw new NotFoundException();
  //     }

  //     const productToUpdate = { ...updateProduct };
  //     console.log('1-check', product);
  //     console.log('1.5-check', img);
  //     const path = require('path');

  //     if (img) {
  //       try {
  //         console.log('Checkimg', img);
  //         const originalname = img.originalname;
  //         const avatarExtension = getFileExtension(originalname);

  //         // Sử dụng đường dẫn tương đối từ file hiện tại đến thư mục public/avatar
  //         const avatarDir = path.resolve(__dirname, '../../../avatar');
  //         const avatarFilename = `${product.product_id}.${avatarExtension}`;
  //         const avatarLocation = path.join(avatarDir, avatarFilename);

  //         if (!fs.existsSync(avatarDir)) {
  //           fs.mkdirSync(avatarDir, { recursive: true });
  //         }
  //         fs.writeFileSync(avatarLocation, img.buffer);
  //         productToUpdate.img = `avatar/${avatarFilename}`; // Lưu đường dẫn tương đối
  //       } catch (error) {
  //         console.error('Lỗi khi ghi file:', error);
  //       }
  //     } else {
  //       console.log('check null image');
  //     }
  //     // Tạo một đối tượng để cập nhật

  //     if (updateProduct.password) {
  //       productToUpdate.password = await bcrypt.hash(
  //         updateProduct.password,
  //         SALT_ROUNDSS,
  //       );
  //     }

  //     // Tạo một đối tượng để cập nhật với chỉ những trường hợp lệ
  //     const updateObject = {};
  //     // Object.keys(productToUpdate).forEach((key) => {
  //     //   if (
  //     //     productToUpdate[key] !== undefined &&
  //     //     key != 'img' &&
  //     //     key != 'password'
  //     //   ) {
  //     //     updateObject[key] = productToUpdate[key];
  //     //   }
  //     // });

  //     Object.keys(productToUpdate).forEach((key) => {
  //       if (productToUpdate[key] !== undefined) {
  //         updateObject[key] = productToUpdate[key];
  //       }
  //     });

  //     await this.productRepository.update({ product_id: id }, updateObject);

  //     await this.productRepository.update({ product_id: id }, productToUpdate);
  //     console.log('2-check', productToUpdate);

  //     return await this.find(product.product_id);
  //   } catch (error) {
  //     // Xử lý lỗi
  //     throw new InternalServerErrorException(error.message);
  //   }
  // }

  async delete(id: number): Promise<void> {
    const product: Product = await this.productRepository.findOneBy({
      product_id: id,
    });

    // Xóa tags và images liên quan
    await this.productTagRepository.delete({ product_id: id });
    await this.productImageRepository.delete({ product_id: id });

    // Kiểm tra sản phẩm có tồn tại hay không ?
    if (!product) {
      throw new NotFoundException();
    }

    this.productRepository.remove(product);
  }
}
