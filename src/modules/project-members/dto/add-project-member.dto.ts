import { IsNotEmpty, IsString } from "class-validator";

export class AddProjectMemberDto {
  @IsNotEmpty()
  @IsString()
  userId!: string;
}
