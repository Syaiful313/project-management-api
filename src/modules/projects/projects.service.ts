import { Injectable } from "@nestjs/common";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";
import { PrismaService } from "../../prisma/prisma.service";
import { ApiError } from "../../common/exceptions/api-error.exception";
import {
  SystemRole,
  GroupRole,
  ProjectRole,
  Status,
} from "../../../generated/prisma/client";

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto, user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      throw new ApiError("Super admin cannot create project", 403);
    }

    const { projectName, description, deadline, isForAdmin } = createProjectDto;

    // Otomatis cari group di mana user adalah Admin/Supervisor
    const userGroup = await this.prisma.groupMember.findFirst({
      where: {
        userId: user.sub,
        role: { in: [GroupRole.ADMIN, GroupRole.SUPERVISOR] },
        deletedAt: null,
      },
      select: { groupId: true, role: true },
    });

    if (!userGroup) {
      throw new ApiError(
        `User (${user.sub}) does not belong to any group as Admin/Supervisor`,
        403,
      );
    }

    const groupId = userGroup.groupId;
    let ownerId = user.sub;

    // Jika pembuat adalah Supervisor dan memilih untuk Admin, cari Admin grup tersebut
    if (userGroup.role === GroupRole.SUPERVISOR && isForAdmin) {
      const groupAdmin = await this.prisma.groupMember.findFirst({
        where: {
          groupId,
          role: GroupRole.ADMIN,
          deletedAt: null,
        },
        select: { userId: true },
      });

      if (groupAdmin) {
        ownerId = groupAdmin.userId;
      }
    }

    const project = await this.prisma.project.create({
      data: {
        groupId,
        projectName,
        description: description ?? "",
        deadline: new Date(deadline),
        creatorId: user.sub,
        progressStatus: Status.DRAFT,
      },
    });

    await this.prisma.projectMember.create({
      data: {
        userId: ownerId,
        projectId: project.id,
        role: ProjectRole.OWNER,
      },
    });

    return project;
  }

  async findAll(user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      return this.prisma.project.findMany({
        where: { deletedAt: null },
        include: {
          members: {
            where: { role: ProjectRole.OWNER, deletedAt: null },
            include: { user: { select: { firstName: true, lastName: true } } },
          },
        },
      });
    }

    const projectMemberships = await this.prisma.projectMember.findMany({
      where: { userId: user.sub, deletedAt: null },
      select: { projectId: true },
    });
    const memberProjectIds = projectMemberships.map((p) => p.projectId);

    return this.prisma.project.findMany({
      where: {
        id: { in: memberProjectIds },
        deletedAt: null,
      },
      include: {
        members: {
          where: { role: ProjectRole.OWNER, deletedAt: null },
          include: { user: { select: { firstName: true, lastName: true } } },
        },
      },
    });
  }

  async findOne(id: string, user: any) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: {
        members: {
          where: { deletedAt: null },
          include: {
            user: { select: { firstName: true, lastName: true, email: true } },
          },
        },
        creator: { select: { firstName: true, lastName: true } },
      },
    });

    if (!project) throw new ApiError("Project not found", 404);

    if (user.role === SystemRole.SUPER_ADMIN) {
      return project;
    }

    const isProjectMember = project.members.some((m) => m.userId === user.sub);

    if (isProjectMember) return project;

    throw new ApiError("Forbidden", 403);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      throw new ApiError("Super admin cannot edit project", 403);
    }

    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) throw new ApiError("Project not found", 404);

    if (project.creatorId !== user.sub) {
      throw new ApiError("Only project owner can edit this project", 403);
    }

    const groupMember = await this.prisma.groupMember.findFirst({
      where: {
        userId: user.sub,
        groupId: project.groupId,
        role: { in: [GroupRole.ADMIN, GroupRole.SUPERVISOR] },
        deletedAt: null,
      },
    });

    if (!groupMember) {
      throw new ApiError(
        "User must be an admin or supervisor in the division",
        403,
      );
    }

    const { projectName, description, deadline, progressStatus } =
      updateProjectDto;

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(projectName && { projectName }),
        ...(description !== undefined && { description }),
        ...(deadline && { deadline: new Date(deadline) }),
        ...(progressStatus && { progressStatus }),
      },
    });
  }

  async remove(id: string, user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      throw new ApiError("Super admin cannot delete project", 403);
    }

    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) throw new ApiError("Project not found", 404);

    if (project.creatorId !== user.sub) {
      throw new ApiError("Only project owner can delete this project", 403);
    }

    const groupMember = await this.prisma.groupMember.findFirst({
      where: {
        userId: user.sub,
        groupId: project.groupId,
        role: { in: [GroupRole.ADMIN, GroupRole.SUPERVISOR] },
        deletedAt: null,
      },
    });

    if (!groupMember) {
      throw new ApiError(
        "User must be an admin or supervisor in the division",
        403,
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async duplicate(id: string, user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      throw new ApiError("Super admin cannot duplicate project", 403);
    }

    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
      include: { tasks: { where: { deletedAt: null } } },
    });

    if (!project) throw new ApiError("Project not found", 404);

    const groupMember = await this.prisma.groupMember.findFirst({
      where: {
        userId: user.sub,
        groupId: project.groupId,
        role: { in: [GroupRole.ADMIN, GroupRole.SUPERVISOR] },
        deletedAt: null,
      },
    });

    if (!groupMember) {
      throw new ApiError(
        "User must be an admin or supervisor in the division",
        403,
      );
    }

    const newProject = await this.prisma.project.create({
      data: {
        groupId: project.groupId,
        projectName: `${project.projectName} (Copy)`,
        description: project.description,
        deadline: project.deadline,
        creatorId: user.sub,
        progressStatus: Status.DRAFT,
      },
    });

    if (project.tasks && project.tasks.length > 0) {
      const tasksData = project.tasks.map((task) => ({
        projectId: newProject.id,
        groupId: project.groupId,
        title: task.title,
        description: task.description,
        status: Status.TODO,
        priorityLevel: task.priorityLevel,
        assigneeId: user.sub, // Default assigned to the creator of duplicate
      }));

      await this.prisma.task.createMany({
        data: tasksData,
      });
    }

    await this.prisma.projectMember.create({
      data: {
        userId: user.sub,
        projectId: newProject.id,
        role: ProjectRole.OWNER,
      },
    });

    return newProject;
  }
}
