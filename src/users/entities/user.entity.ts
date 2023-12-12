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

/**
 * https://orkhan.gitbook.io/typeorm/docs/decorator-reference
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  user_id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  password: string;

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ name: 'bday', type: 'varchar', length: 255, nullable: true })
  bday: string;

  @Column({ name: 'date', type: 'varchar', length: 255, nullable: true })
  date: string;

  @Column({ name: 'status', type: 'tinyint', nullable: true })
  status: number = 1;

  @Column({ name: 'add_address', type: 'varchar', length: 255, nullable: true })
  add_address: string;

  @Column({ name: 'phone', type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ name: 'img', type: 'varchar', length: 255, nullable: true })
  img: string;

  @Column({ name: 'cart', type: 'json', nullable: true })
  cart: object = [];

  @Column({ name: 'code', type: 'varchar', length: 45, nullable: true })
  code?: string;

  @Column({ name: 'verifed', type: 'tinyint', nullable: true })
  verifed: number = 0;
}
