import { Message } from '../entities/message.entity';

export class MessageResponse {
  id: number;
  email: string;
  name: string;
  phone: string;
  date: string;
  status: number;
  mess: string;

  constructor(message: Message) {
    this.id = message.id;
    this.email = message.email;
    this.name = message.name;
    this.phone = message.phone;
    this.date = message.date;
    this.status = message.status;
    this.mess = message.mess;
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
