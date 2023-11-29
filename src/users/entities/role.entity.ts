import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user.entity";

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'code', type: 'varchar', length: 10, unique: true })
    code: string;

    @Column({ name: 'name', type: 'varchar', length: 255 })
    name: string;

    @ManyToMany(() => User, (user: User) => user.roles)
    @JoinTable({
        name: 'role_users',
        joinColumn: {
            name: "role_id",
            referencedColumnName: "id",
            foreignKeyConstraintName: "fk_role_id"
        },
        inverseJoinColumn: {
            name: "user_id",
            referencedColumnName: "id",
            foreignKeyConstraintName: "fk_user_id"
        },
    })
    users: User[];
}
