import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsNumber()
  @IsOptional()
  totalKpi?: number;

  @IsBoolean()
  @IsOptional()
  isStrict?: boolean;
}
