import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ApiError } from "../../common/exceptions/api-error.exception";
import {
  SystemRole,
  GroupRole,
  ProjectRole,
  Status,
} from "../../../generated/prisma/client";
import { AddProjectMemberDto } from "./dto/add-project-member.dto";
import { UpdateProjectMemberDto } from "./dto/update-project-member.dto";

@Injectable()
export class ProjectMembersService {
  constructor(private readonly prisma: PrismaService) {}

  // Helper untuk mengecek apakah user memiliki hak akses (Admin/Supervisor) di grup/divisi yang menaungi project
  private async checkGroupAdminOrSupervisor(userId: string, groupId: string) {
    const groupMember = await this.prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
        role: { in: [GroupRole.ADMIN, GroupRole.SUPERVISOR] },
        deletedAt: null,
      },
    });

    if (!groupMember) {
      throw new ApiError(
        "Forbidden: You must be an ADMIN or SUPERVISOR in this division",
        403,
      );
    }
    return groupMember;
  }

  // Helper untuk mengecek apakah user berada di grup/divisi project (Admin/Supervisor/Member)
  private async checkGroupMember(userId: string, groupId: string) {
    const groupMember = await this.prisma.groupMember.findFirst({
      where: {
        userId,
        groupId,
        deletedAt: null,
      },
    });

    if (!groupMember) {
      throw new ApiError(
        "Forbidden: You are not a member of this division",
        403,
      );
    }
    return groupMember;
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

    // Untuk Admin / Supervisor / Member: cek apakah mereka ada di divisi project
    await this.checkGroupMember(user.sub, project.groupId);

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
      // Untuk Admin / Supervisor / Member: cek apakah mereka ada di divisi project
      await this.checkGroupMember(user.sub, project.groupId);
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

    // Executor harus Admin / Supervisor di divisi
    await this.checkGroupAdminOrSupervisor(user.sub, project.groupId);

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

    // Executor harus Admin / Supervisor di divisi
    await this.checkGroupAdminOrSupervisor(user.sub, project.groupId);

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

    // Executor harus Admin / Supervisor di divisi
    await this.checkGroupAdminOrSupervisor(user.sub, project.groupId);

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

    // 2. Cek apakah user masih ada di Scuto dan masih ada di divisi (sesuai instruksi)
    const isUserSoftDeleted = targetUser.deletedAt !== null;

    const targetGroupMember = await this.prisma.groupMember.findFirst({
      where: {
        userId: targetUser.id,
        groupId: project.groupId,
        deletedAt: null,
      },
    });
    const isUserStillInDivison = !!targetGroupMember;

    // Hanya bisa di-delete JIKA user sudah tidak ada di scuto ATAU pindah/tidak ada di divisi.
    if (!isUserSoftDeleted && isUserStillInDivison) {
      throw new ApiError(
        "Cannot delete member: User is still active and belongs to this division.",
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
