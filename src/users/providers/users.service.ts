import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserRequest } from "../requests/create-user.request";
import { User } from "../entities/user.entity";
import { UpdateUserRequest } from "../requests/update-user.request";
import { UserResponse } from "../responses/user.response";

// Tài liệu: https://docs.nestjs.com/providers#services
@Injectable()
export class UsersService {
    private static users: Array<User> = [];

    search(keyword?: string, page?: number, limit?: number): UserResponse[] {
        return UsersService.users.filter((user: User) => !user.isDeleted && (!keyword || user.email.includes(keyword)))
            .map((user: User) => new UserResponse(user));
    }

    create(createUser: CreateUserRequest): void {
        const user: User = new User();
        user.id = UsersService.users.length + 1; // TODO: ID tự động tăng
        user.username = createUser.username;
        user.email = createUser.email;
        user.firstName = createUser.firstName;
        user.lastName = createUser.lastName;
        user.password = createUser.password; // TODO: mã hóa

        UsersService.users.push(user);
    }

    find(id: number): UserResponse {
        const user: User = UsersService.users.find(value => value.id === id && !value.isDeleted);

        // Kiểm tra người dùng có tồn tại hay không ?
        if (!user) {
            throw new NotFoundException();
        }

        return new UserResponse(user);
    }

    update(id: number, updateUser: UpdateUserRequest): UserResponse {
        const user: User = UsersService.users.find(value => value.id === id && !value.isDeleted);

        // Kiểm tra người dùng có tồn tại hay không ?
        if (!user) {
            throw new NotFoundException();
        }

        const users: User[] = UsersService.users.map(user => {
            if (id === user.id) {
                return {
                    ...user,
                    firstName: updateUser.firstName,
                    lastName: updateUser.lastName,
                }
            }

            return user;
        });

        UsersService.users = users;

        return this.find(id);
    }

    delete(id: number): void {
        const user: User = UsersService.users.find(value => value.id === id && !value.isDeleted);

        // Kiểm tra người dùng có tồn tại hay không ?
        if (!user) {
            throw new NotFoundException();
        }

        const users: User[] = UsersService.users.map(user => {
            if (id === user.id) {
                return {
                    ...user,
                    isDeleted: true,
                };
            }

            return user;
        });

        UsersService.users = users;
    }
}
