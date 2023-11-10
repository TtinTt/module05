export class User {
    id: number;

    username: string;

    email: string;

    firstName?: string;

    lastName?: string;

    isDeleted: boolean = false;

    password: string;
}