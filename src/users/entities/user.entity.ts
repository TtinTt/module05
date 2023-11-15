import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * https://orkhan.gitbook.io/typeorm/docs/decorator-reference
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ name: 'bday', type: 'varchar', length: 255, nullable: true })
  bday?: string;

  @Column({ name: 'date', type: 'varchar', length: 255, nullable: true })
  date?: string;

  @Column({ name: 'status', type: 'tinyint', length: 1, nullable: true })
  status?: number;

  @Column({ name: 'add_address', type: 'varchar', length: 255, nullable: true })
  add_address?: string;

  @Column({ name: 'phone', type: 'varchar', length: 15, nullable: true })
  phone?: string;

  @Column({ name: 'img', type: 'varchar', length: 255, nullable: true })
  img?: string;

  @Column({ name: 'cart', type: 'json', nullable: true })
  cart?: string;

  @Column({
    name: 'api_key',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  api_key?: string;

  @Column({ name: 'code', type: 'varchar', length: 45, nullable: true })
  code?: string;
}
