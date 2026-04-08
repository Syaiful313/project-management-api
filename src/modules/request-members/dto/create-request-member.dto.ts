import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { ProjectRole } from "../../../../generated/prisma/client";

export class CreateRequestMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(ProjectRole)
  @IsNotEmpty()
  role!: ProjectRole;
}
