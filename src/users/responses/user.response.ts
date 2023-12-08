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

  constructor(user: User) {
    this.user_id = user.userId;
    this.email = user.email;
    this.name = user.name || null;
    this.bday = user.bday || null;
    this.add_address = user.add_address || null;
    this.phone = user.phone || null;
    this.img = user.img || null;
    this.status = user.status;
  }
}
