import { Injectable } from "@nestjs/common";
import { CreateRecurringTaskDto } from "./dto/create-recurring-task.dto";
import { UpdateRecurringTaskDto } from "./dto/update-recurring-task.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class RecurringTasksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createRecurringTaskDto: CreateRecurringTaskDto) {
    return this.prisma.recurringTask.create({
      data: createRecurringTaskDto,
    });
  }

  findAll(groupId?: string) {
    return this.prisma.recurringTask.findMany({
      where: groupId ? { groupId } : undefined,
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true },
        },
        group: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: string) {
    return this.prisma.recurringTask.findUnique({
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

  update(id: string, updateRecurringTaskDto: UpdateRecurringTaskDto) {
    return this.prisma.recurringTask.update({
      where: { id },
      data: updateRecurringTaskDto,
    });
  }

  remove(id: string) {
    return this.prisma.recurringTask.delete({
      where: { id },
    });
  }
}
