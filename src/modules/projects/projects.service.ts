import { Injectable } from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createProjectDto: CreateProjectDto, ownerId: string) {
    const { projectName, description, deadline, picId } = createProjectDto;
    return this.prisma.project.create({
      data: {
        projectName,
        description: description ?? "",
        deadline: new Date(deadline),
        ownerId,
        picId,
      },
    });
  }

  findAll() {
    return this.prisma.project.findMany({
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });
  }

  findOne(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      include: {
        owner: true,
        pic: true,
      },
    });
  }

  update(id: string, updateProjectDto: UpdateProjectDto) {
    const { deadline, ...rest } = updateProjectDto;
    return this.prisma.project.update({
      where: { id },
      data: {
        ...rest,
        ...(deadline && { deadline: new Date(deadline) }),
      },
    });
  }

  remove(id: string) {
    return this.prisma.project.delete({ where: { id } });
  }
}
