import { Order } from '../entities/order.entity';

export class OrderResponse {
  id: number;
  email: string;
  cart: string;
  address: string;
  date: string;
  status: number;

  constructor(order: Order) {
    this.id = order.id;
    this.email = order.email;
    this.cart = order.cart;
    this.address = order.address;
    this.date = order.date;
    this.status = order.status;
  }
}
//???
// // @Column()
// id: number;

// @Column({ type: 'varchar', length: 255 })
// email: string;

// @Column({ name: 'cart_json', type: 'json' })
// cart: object[] ;

// @Column({ name: 'address_json', type: 'json' })
// address: object ;

// @Column({ type: 'varchar', length: 255 })
// date: string;

// @Column({ name: 'status', type: 'tinyint' })
// status: number = 0;
