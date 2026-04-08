import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ProjectMembersService } from "./project-members.service";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { UpdateProjectMemberDto } from "./dto/update-project-member.dto";

@UseGuards(JwtAuthGuard)
@Controller("projects/:projectId/members")
export class ProjectMembersController {
  constructor(private readonly projectMembersService: ProjectMembersService) {}

  @Get()
  findAll(@Param("projectId") projectId: string, @Req() req: any) {
    return this.projectMembersService.findAll(projectId, req.user);
  }

  @Get(":memberId")
  findOne(
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string,
    @Req() req: any,
  ) {
    return this.projectMembersService.findOne(projectId, memberId, req.user);
  }

  @Post()
  create(
    @Param("projectId") projectId: string,
    @Body() dto: AddProjectMemberDto,
    @Req() req: any,
  ) {
    return this.projectMembersService.create(projectId, dto, req.user);
  }

  @Patch(":memberId")
  update(
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string,
    @Body() dto: UpdateProjectMemberDto,
    @Req() req: any,
  ) {
    return this.projectMembersService.update(
      projectId,
      memberId,
      dto,
      req.user,
    );
  }

  @Delete(":memberId")
  remove(
    @Param("projectId") projectId: string,
    @Param("memberId") memberId: string,
    @Req() req: any,
  ) {
    return this.projectMembersService.remove(projectId, memberId, req.user);
  }
}
