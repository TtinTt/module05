import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateUserRequest } from "../requests/create-user.request";
import { User } from "../entities/user.entity";

// Tài liệu: https://docs.nestjs.com/providers#services
@Injectable()
export class UsersService {
    private static users: Array<User> = [];

    search(keyword?: string, page?: number, limit?: number): User[] {
        return UsersService.users.filter((user, index) => !keyword || user.email.includes(keyword));
    }

    create(createUser: CreateUserRequest): void {
        const user: User = new User();
        user.id = UsersService.users.length + 1;
        user.username = createUser.username;
        user.email = createUser.email;
        user.firstName = createUser.firstName;
        user.lastName = createUser.lastName;

        UsersService.users.push(user);
    }

    find(id: number): User {
        const user: User = UsersService.users.find(value => value.id === id);

        if (!user) {
            throw new NotFoundException();
        }

        return user;
    }
}
