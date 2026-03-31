import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { Role } from "../../../../generated/prisma/client";

export class CreateRequestMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  projectId!: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}
