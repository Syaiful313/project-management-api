import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  projectName!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  @IsNotEmpty()
  deadline!: string;

  @IsBoolean()
  @IsOptional()
  isForAdmin?: boolean;
}
