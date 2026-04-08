import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateProjectDto {
  @IsUUID()
  @IsNotEmpty()
  groupId!: string;

  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  deadline!: string;
}
