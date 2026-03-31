import { Injectable } from "@nestjs/common";
import { CreateRequestMemberDto } from "./dto/create-request-member.dto";
import { UpdateRequestMemberDto } from "./dto/update-request-member.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RequestMembersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRequestMemberDto: CreateRequestMemberDto) {
    return this.prisma.requestMember.create({
      data: createRequestMemberDto,
    });
  }

  findAll(projectId?: string) {
    return this.prisma.requestMember.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        project: {
          select: {
            id: true,
            projectName: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.requestMember.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        project: {
          select: { id: true, projectName: true },
        },
      },
    });
  }

  update(id: string, updateRequestMemberDto: UpdateRequestMemberDto) {
    return this.prisma.requestMember.update({
      where: { id },
      data: updateRequestMemberDto,
    });
  }

  remove(id: string) {
    return this.prisma.requestMember.delete({
      where: { id },
    });
  }
}
