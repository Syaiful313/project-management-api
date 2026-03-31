import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { Role } from "../../../../generated/prisma/client";

export class CreateGroupMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  groupId!: string;

  @IsEnum(Role)
  @IsNotEmpty()
  role!: Role;
}
