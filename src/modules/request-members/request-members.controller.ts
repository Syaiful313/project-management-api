import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { RequestMembersService } from "./request-members.service";
import { CreateRequestMemberDto } from "./dto/create-request-member.dto";
import { UpdateRequestMemberDto } from "./dto/update-request-member.dto";

@Controller("request-members")
export class RequestMembersController {
  constructor(private readonly requestMembersService: RequestMembersService) {}

  @Post()
  create(@Body() createRequestMemberDto: CreateRequestMemberDto) {
    return this.requestMembersService.create(createRequestMemberDto);
  }

  @Get()
  findAll(@Query("projectId") projectId?: string) {
    return this.requestMembersService.findAll(projectId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.requestMembersService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateRequestMemberDto: UpdateRequestMemberDto,
  ) {
    return this.requestMembersService.update(id, updateRequestMemberDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.requestMembersService.remove(id);
  }
}
