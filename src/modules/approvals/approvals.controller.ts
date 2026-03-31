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
import { ApprovalsService } from "./approvals.service";
import { CreateApprovalDto } from "./dto/create-approval.dto";
import { UpdateApprovalDto } from "./dto/update-approval.dto";

@Controller("approvals")
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Post()
  create(@Body() createApprovalDto: CreateApprovalDto) {
    return this.approvalsService.create(createApprovalDto);
  }

  @Get()
  findAll(@Query("taskId") taskId?: string) {
    return this.approvalsService.findAll(taskId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.approvalsService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateApprovalDto: UpdateApprovalDto,
  ) {
    return this.approvalsService.update(id, updateApprovalDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.approvalsService.remove(id);
  }
}
