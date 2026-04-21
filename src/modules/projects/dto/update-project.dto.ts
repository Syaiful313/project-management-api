import { PartialType } from "@nestjs/mapped-types";
import { CreateProjectDto } from "./create-project.dto";
import { IsEnum, IsOptional } from "class-validator";
import { Status } from "../../../../generated/prisma/client";

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsEnum(Status)
  @IsOptional()
  progressStatus?: Status;
}
