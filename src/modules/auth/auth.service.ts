import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { ApiError } from "../../common/exceptions/api-error.exception";
import { RegisterDTO } from "./dto/register.dto";
import { LoginDTO } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(body: RegisterDTO) {
    const existing = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (existing) {
      throw new ApiError("Email already registered", 409);
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const user = await this.prisma.user.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: hashedPassword,
        role: body.role, // Akan menggunakan default dari schema jika undefined
      },
    });

    const { password: _, ...result } = user;
    return result;
  }

  async login(body: LoginDTO) {
    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      throw new ApiError("Invalid email or password", 401);
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);

    if (!isPasswordValid) {
      throw new ApiError("Invalid email or password", 401);
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken,
    };
  }

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ApiError("User not found", 404);
    }

    const { password: _, ...result } = user;
    return result;
  }
}
