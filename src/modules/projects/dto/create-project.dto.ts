import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
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

  @IsUUID()
  @IsOptional()
  picId?: string;
}
