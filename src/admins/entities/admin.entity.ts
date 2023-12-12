import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
//   import { AdminProfile } from './admin-profile.entity';
//   import { AdminPassword } from './admin-password.entity';
//   import { Role } from './role.entity';

/**
 * https://orkhan.gitbook.io/typeorm/docs/decorator-reference
 */
@Entity('admins')
export class Admin {
  @PrimaryGeneratedColumn({ name: 'admin_id' })
  admin_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'date', type: 'varchar', length: 255, nullable: true })
  date?: string;

  @Column({ name: 'status', type: 'tinyint', nullable: true })
  status: number = 1;
}
