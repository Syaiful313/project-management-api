import { Injectable } from "@nestjs/common";
import {
  ProjectRole,
  Status,
  SystemRole,
} from "../../../generated/prisma/client";
import { ApiError } from "../../common/exceptions/api-error.exception";
import { PrismaService } from "../../prisma/prisma.service";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { UpdateProjectMemberDto } from "./dto/update-project-member.dto";

@Injectable()
export class ProjectMembersService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper untuk mengecek apakah user adalah OWNER atau PIC dalam project ini
  private async checkProjectOwnerOrPic(userId: string, projectId: string) {
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        userId,
        projectId,
        role: { in: [ProjectRole.OWNER, ProjectRole.PIC] },
        deletedAt: null,
      },
    });

    if (!projectMember) {
      throw new ApiError(
        "Forbidden: You must be an OWNER or PIC in this project",
        403,
      );
    }
    return projectMember;
  }

  // Helper untuk mengecek apakah user adalah bagian dari project
  private async checkProjectMember(userId: string, projectId: string) {
    const projectMember = await this.prisma.projectMember.findFirst({
      where: {
        userId,
        projectId,
        deletedAt: null,
      },
    });

    if (!projectMember) {
      throw new ApiError(
        "Forbidden: You are not a member of this project",
        403,
      );
    }
    return projectMember;
  }

  async findAll(projectId: string, user: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new ApiError("Project not found", 404);

    if (user.role === SystemRole.SUPER_ADMIN) {
      return this.prisma.projectMember.findMany({
        where: { projectId, deletedAt: null },
        include: {
          user: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
        },
      });
    }

    // Untuk role selain SUPER_ADMIN: cek apakah mereka ada di dalam project
    await this.checkProjectMember(user.sub, projectId);

    return this.prisma.projectMember.findMany({
      where: { projectId, deletedAt: null },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });
  }

  async findOne(projectId: string, memberId: string, user: any) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new ApiError("Project not found", 404);

    if (user.role !== SystemRole.SUPER_ADMIN) {
      // Untuk role selain SUPER_ADMIN: cek apakah mereka ada di dalam project
      await this.checkProjectMember(user.sub, projectId);
    }

    const member = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId, deletedAt: null },
      include: {
        user: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    if (!member) throw new ApiError("Project member not found", 404);
    return member;
  }

  async create(projectId: string, dto: AddProjectMemberDto, user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      throw new ApiError("Super Admin cannot add member to a project", 403);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new ApiError("Project not found", 404);

    // Executor harus Owner / PIC di dalam project
    await this.checkProjectOwnerOrPic(user.sub, projectId);

    // Member yang ditambahkan HARUS ada di divisi yang sama
    const targetGroupMember = await this.prisma.groupMember.findFirst({
      where: { userId: dto.userId, groupId: project.groupId, deletedAt: null },
    });

    if (!targetGroupMember) {
      throw new ApiError(
        "Cannot add user: User is not a member of this division",
        400,
      );
    }

    // Cek apakah member sudah ada di project
    const existingProjectMember = await this.prisma.projectMember.findFirst({
      where: { userId: dto.userId, projectId, deletedAt: null },
    });

    if (existingProjectMember) {
      throw new ApiError("User is already a member of this project", 400);
    }

    return this.prisma.projectMember.create({
      data: {
        projectId,
        userId: dto.userId,
        role: ProjectRole.MEMBER, // Default role as MEMBER
      },
    });
  }

  async update(
    projectId: string,
    memberId: string,
    dto: UpdateProjectMemberDto,
    user: any,
  ) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      throw new ApiError("Super Admin cannot edit project member", 403);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new ApiError("Project not found", 404);

    // Executor harus Owner / PIC di dalam project
    await this.checkProjectOwnerOrPic(user.sub, projectId);

    const member = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId, deletedAt: null },
    });
    if (!member) throw new ApiError("Project member not found", 404);

    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: {
        ...(dto.role && { role: dto.role }),
      },
    });
  }

  async remove(projectId: string, memberId: string, user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      throw new ApiError("Super Admin cannot delete project member", 403);
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId, deletedAt: null },
    });
    if (!project) throw new ApiError("Project not found", 404);

    // Executor harus Owner / PIC di dalam project
    await this.checkProjectOwnerOrPic(user.sub, projectId);

    const projectMember = await this.prisma.projectMember.findFirst({
      where: { id: memberId, projectId, deletedAt: null },
      include: { user: true },
    });
    if (!projectMember) throw new ApiError("Project member not found", 404);

    const targetUser = projectMember.user;

    // 1. Cek Active Tasks (Status bukan DONE)
    const activeTasksCount = await this.prisma.task.count({
      where: {
        projectId,
        assigneeId: targetUser.id,
        deletedAt: null,
        status: { not: Status.DONE },
      },
    });

    if (activeTasksCount > 0) {
      throw new ApiError(
        "Cannot delete member: Please reassign or complete their active tasks first.",
        400,
      );
    }

    // Hapus (soft delete) member dari project
    return this.prisma.projectMember.update({
      where: { id: memberId },
      data: { deletedAt: new Date() },
    });
  }
}
