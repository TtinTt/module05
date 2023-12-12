import { Product } from '../entities/product.entity';
import { ProductTag } from '../entities/product-tag.entity';
import { ProductImage } from '../entities/product-image.entity';

export class ProductResponse {
  product_id: number;
  name: string;
  price: number;
  comparative: number;
  sku: string;
  description: string;
  tag: string[];
  img: string[];

  constructor(product: {
    product_id: number;
    name: string;
    price: number;
    comparative: number;
    sku: string;
    description: string;
    tag: string[];
    img: string[];
  }) {
    this.product_id = product.product_id;
    this.name = product.name || null;
    this.price = product.price || null;
    this.comparative = product.comparative || null;
    this.sku = product.sku || null;
    this.description = product.description || null;
    this.tag = product.tag;
    this.img = product.img;
  }
}
//???
