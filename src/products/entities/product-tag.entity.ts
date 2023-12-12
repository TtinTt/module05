import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';

@Entity('product_tags')
export class ProductTag {
  @PrimaryGeneratedColumn()
  tag_id: number;

  @Column()
  product_id: number;

  @Column({ type: 'varchar', length: 50 })
  tag: string;

  @ManyToOne(() => Product, (product) => product.tag)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
