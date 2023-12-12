import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'varchar', length: 15, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  date: string;

  @Column({ type: 'text', nullable: true })
  mess: string;

  @Column({ type: 'int', default: 1 })
  status: number;
}
