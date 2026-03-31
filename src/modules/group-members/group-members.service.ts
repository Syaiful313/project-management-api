import { Injectable } from "@nestjs/common";
import { CreateGroupMemberDto } from "./dto/create-group-member.dto";
import { UpdateGroupMemberDto } from "./dto/update-group-member.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GroupMembersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createGroupMemberDto: CreateGroupMemberDto) {
    return this.prisma.groupMember.create({
      data: createGroupMemberDto,
    });
  }

  findAll(groupId?: string) {
    return this.prisma.groupMember.findMany({
      where: groupId ? { groupId } : undefined,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        group: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.groupMember.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        group: {
          select: { id: true, title: true },
        },
      },
    });
  }

  update(id: string, updateGroupMemberDto: UpdateGroupMemberDto) {
    return this.prisma.groupMember.update({
      where: { id },
      data: updateGroupMemberDto,
    });
  }

  remove(id: string) {
    return this.prisma.groupMember.delete({
      where: { id },
    });
  }
}
