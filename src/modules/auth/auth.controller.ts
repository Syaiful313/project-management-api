import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { SystemRole } from "../../../generated/prisma/client";
import { AuthService } from "./auth.service";
import { Roles } from "./decorators/roles.decorator";
import { LoginDTO } from "./dto/login.dto";
import { RegisterDTO } from "./dto/register.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { RolesGuard } from "./guards/roles.guard";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @Post("register")
  async register(@Body() body: RegisterDTO) {
    return await this.authService.register(body);
  }

  @Post("login")
  async login(@Body() body: LoginDTO) {
    return await this.authService.login(body);
  }

  @UseGuards(JwtAuthGuard)
  @Get("profile")
  async getProfile(@Req() req: any) {
    return await this.authService.getProfile(req.user.sub);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(SystemRole.SUPER_ADMIN)
  @Get("admin")
  async adminOnly() {
    return { message: "Admin access granted" };
  }
}
