import { IsEnum, IsNotEmpty, IsUUID } from "class-validator";
import { GroupRole } from "../../../../generated/prisma/client";

export class CreateGroupMemberDto {
  @IsUUID()
  @IsNotEmpty()
  userId!: string;

  @IsUUID()
  @IsNotEmpty()
  groupId!: string;

  @IsEnum(GroupRole)
  @IsNotEmpty()
  role!: GroupRole;
}
