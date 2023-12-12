import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn({ name: 'order_id' })
  // @Column()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'cart_json', type: 'json' })
  cart: string;

  @Column({ name: 'address_json', type: 'json' })
  address: string;

  @Column({ type: 'varchar', length: 255 })
  date: string;

  @Column({ name: 'status', type: 'tinyint' })
  status: number = 0;
}
