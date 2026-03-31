import { PartialType } from "@nestjs/mapped-types";
import { CreateRequestMemberDto } from "./create-request-member.dto";

export class UpdateRequestMemberDto extends PartialType(
  CreateRequestMemberDto,
) {}
