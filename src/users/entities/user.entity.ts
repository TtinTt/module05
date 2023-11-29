import { Column, CreateDateColumn, DeleteDateColumn, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserProfile } from "./user-profile.entity";
import { UserPassword } from "./user-password.entity";
import { Role } from "./role.entity";

/**
 * https://orkhan.gitbook.io/typeorm/docs/decorator-reference
 */
@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 20, unique: true })
    username: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email: string;

    @Column({ name: 'first_name', type: 'varchar', length: 50, nullable: true })
    firstName?: string;

    @Column({ name: 'last_name', type: 'varchar', length: 50, nullable: true })
    lastName?: string;

    @Column({ type: 'varchar', length: 255 })
    password: string;

    @CreateDateColumn({ name: 'created_at', type: 'datetime' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at', type: 'datetime' })
    updatedAt: Date;

    /**
     * NULL: chưa xóa
     * Có giá trị: thời điểm bản ghi bị xóa
     */
    @DeleteDateColumn({ name: 'deleted_at', type: 'datetime' })
    deletedAt?: Date;

    @OneToOne(() => UserProfile, (profile: UserProfile) => profile.user)
    profile: UserProfile;

    @OneToMany(() => UserPassword, (userPassword: UserPassword) => userPassword.user)
    passwords: UserPassword[];

    @ManyToMany(() => Role, (role: Role) => role.users)
    roles: Role[];
}
