import { Injectable } from "@nestjs/common";
import { CreateGroupDto } from "./dto/create-group.dto";
import { UpdateGroupDto } from "./dto/update-group.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createGroupDto: CreateGroupDto) {
    const { title, totalKpi, isStrict } = createGroupDto;
    return this.prisma.group.create({
      data: {
        title,
        totalKpi,
        isStrict: isStrict ?? false,
      },
    });
  }

  findAll() {
    return this.prisma.group.findMany({
      include: {
        projects: {
          select: {
            projectName: true,
          },
        },
        _count: {
          select: { members: true, tasks: true },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.group.findUnique({
      where: { id },
      include: {
        projects: true,
        members: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  update(id: string, updateGroupDto: UpdateGroupDto) {
    return this.prisma.group.update({
      where: { id },
      data: updateGroupDto,
    });
  }

  remove(id: string) {
    return this.prisma.group.delete({
      where: { id },
    });
  }
}
