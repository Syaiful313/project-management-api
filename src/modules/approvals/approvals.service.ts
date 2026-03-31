import { Injectable } from "@nestjs/common";
import { CreateApprovalDto } from "./dto/create-approval.dto";
import { UpdateApprovalDto } from "./dto/update-approval.dto";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ApprovalsService {
  constructor(private readonly prisma: PrismaService) {}

  create(createApprovalDto: CreateApprovalDto) {
    return this.prisma.approval.create({
      data: createApprovalDto,
    });
  }

  findAll(taskId?: string) {
    return this.prisma.approval.findMany({
      where: taskId ? { taskId } : undefined,
      include: {
        submit: {
          select: { id: true, firstName: true, lastName: true },
        },
        review: {
          select: { id: true, firstName: true, lastName: true },
        },
        task: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  findOne(id: string) {
    return this.prisma.approval.findUnique({
      where: { id },
      include: {
        submit: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        review: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
        task: true,
      },
    });
  }

  update(id: string, updateApprovalDto: UpdateApprovalDto) {
    return this.prisma.approval.update({
      where: { id },
      data: updateApprovalDto,
    });
  }

  remove(id: string) {
    return this.prisma.approval.delete({
      where: { id },
    });
  }
}
