import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../providers/auth.service";
import { LoginRequest } from "../requests/login.request";
import { LoginResponse } from "../responses/login.response";
import { Public } from "../decorators/auth.decorator";

@Controller()
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('/login')
    async login(@Body() requestBody: LoginRequest): Promise<LoginResponse> {
        return this.authService.login(requestBody);
    }
}
