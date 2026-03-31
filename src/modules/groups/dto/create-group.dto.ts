import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsUUID()
  @IsNotEmpty()
  projectId!: string;

  @IsNumber()
  @IsOptional()
  totalKpi?: number;

  @IsBoolean()
  @IsOptional()
  isStrict?: boolean;
}
