import { User } from '../entities/user.entity';

export class UserResponse {
  user_id: number;
  email: string;
  name: string;
  bday: string;
  add_address: string;
  phone: string;
  img: string;
  status: number;
  cart: object;
  date: string;
  verifed: number;

  constructor(user: User) {
    this.user_id = user.user_id;
    this.email = user.email;
    this.name = user.name || null;
    this.bday = user.bday || null;
    this.add_address = user.add_address || null;
    this.phone = user.phone || null;
    this.img = user.img || null;
    this.status = user.status;
    this.cart = user.cart;
    this.date = user.date;
    this.verifed = user.verifed;
  }
}
