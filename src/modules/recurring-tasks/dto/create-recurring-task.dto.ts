import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
} from "class-validator";
import { Frequency } from "../../../../generated/prisma/client";

export class CreateRecurringTaskDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsUUID()
  @IsNotEmpty()
  assignTo!: string;

  @IsUUID()
  @IsNotEmpty()
  groupId!: string;

  @IsEnum(Frequency)
  @IsNotEmpty()
  frequency!: Frequency;

  @IsNumber()
  @IsNotEmpty()
  interval!: number;
}
