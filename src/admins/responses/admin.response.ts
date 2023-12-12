import { Admin } from '../entities/admin.entity';

export class AdminResponse {
  admin_id: number;
  email: string;
  status: number;
  date: string;
  constructor(admin: Admin) {
    this.admin_id = admin.admin_id;
    this.email = admin.email;
    this.date = admin.date;
    this.status = admin.status;
  }
}
