import { Injectable, UnauthorizedException } from "@nestjs/common";
import { LoginResponse } from "../responses/login.response";
import { Repository } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { LoginRequest } from "../requests/login.request";
import * as bcrypt from 'bcrypt';
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
    ) { }

    async login(loginRequest: LoginRequest): Promise<LoginResponse> {
        const user = await this.userRepository.findOneBy({
            username: loginRequest.username,
        });

        // Nếu không tìm thấy người dùng thì trả về lỗi
        if (!user) {
            throw new UnauthorizedException('Không thể xác thực.');
        }

        // Kiểm tra mật khẩu, nếu không trùng khớp thì trả về lỗi
        const isMatch = await bcrypt.compare(loginRequest.password, user.password)
        if (!isMatch) {
            throw new UnauthorizedException('Không thể xác thực.');
        }

        // Tạo ra token (sử dụng JWT)
        const payload = { sub: user.id, username: user.username };
        const token = await this.jwtService.signAsync(payload);

        const loginResponse = new LoginResponse();
        loginResponse.token = token;

        // Trả về token cho client
        return loginResponse;
    }
}
