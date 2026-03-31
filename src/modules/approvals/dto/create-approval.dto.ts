import { IsBoolean, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

export class CreateApprovalDto {
  @IsUUID()
  @IsNotEmpty()
  taskId!: string;

  @IsUUID()
  @IsNotEmpty()
  submitById!: string;

  @IsBoolean()
  @IsOptional()
  isApproved?: boolean;

  @IsUUID()
  @IsOptional()
  reviewById?: string;
}
