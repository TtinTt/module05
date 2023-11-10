import { User } from "../entities/user.entity";

export class UserResponse {
    id: number;

    username: string;

    email: string;

    firstName?: string;

    lastName?: string;

    constructor(user: User) {
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
    }
}