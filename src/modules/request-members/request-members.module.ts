import { Module } from "@nestjs/common";
import { RequestMembersController } from "./request-members.controller";
import { RequestMembersService } from "./request-members.service";

@Module({
  controllers: [RequestMembersController],
  providers: [RequestMembersService],
})
export class RequestMembersModule {}
