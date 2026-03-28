import { HttpException } from "@nestjs/common";

export class ApiError extends HttpException {
  constructor(message: string, status: number) {
    super(message, status);
  }
}
