import { Injectable } from "@nestjs/common";
import { CreateTaskDto } from "./dto/create-task.dto";
import { UpdateTaskDto } from "./dto/update-task.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createTaskDto: CreateTaskDto) {
    const { startDate, dueDate, ...rest } = createTaskDto;
    return this.prisma.task.create({
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });
  }

  findAll(projectId?: string, groupId?: string) {
    return this.prisma.task.findMany({
      where: {
        ...(projectId && { projectId }),
        ...(groupId && { groupId }),
      },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true },
        },
        group: {
          select: { id: true, title: true },
        },
        _count: {
          select: { approvals: true },
        },
      },
      orderBy: [{ priorityLevel: "desc" }, { createdAt: "desc" }],
    });
  }

  findOne(id: string) {
    return this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        project: {
          select: { id: true, projectName: true },
        },
        group: {
          select: { id: true, title: true },
        },
        approvals: true,
      },
    });
  }

  update(id: string, updateTaskDto: UpdateTaskDto) {
    const { startDate, dueDate, ...rest } = updateTaskDto;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate && { startDate: new Date(startDate) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
      },
    });
  }

  remove(id: string) {
    return this.prisma.task.delete({
      where: { id },
    });
  }
}
