import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductImage } from './product-image.entity';
import { ProductTag } from './product-tag.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  product_id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  price: number;

  @Column({ type: 'decimal', precision: 10, scale: 0 })
  comparative: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  sku: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @OneToMany(() => ProductTag, (productTag) => productTag.product, {
    cascade: ['remove'],
  })
  tag: ProductTag[];

  @OneToMany(() => ProductImage, (productImage) => productImage.product, {
    cascade: ['remove'],
  })
  images: ProductImage[];
}
