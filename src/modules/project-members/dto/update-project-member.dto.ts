import { IsEnum, IsOptional } from "class-validator";
import { ProjectRole } from "../../../../generated/prisma/client";

export class UpdateProjectMemberDto {
  @IsOptional()
  @IsEnum(ProjectRole)
  role?: ProjectRole;
}
