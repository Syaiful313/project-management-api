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

    const { groupId, projectName, description, deadline } = createProjectDto;

    const group = await this.prisma.group.findFirst({
      where: { id: groupId, deletedAt: null },
    });

    if (!group) throw new ApiError("Group not found", 404);

    const groupMember = await this.prisma.groupMember.findFirst({
      where: {
        userId: user.sub,
        groupId,
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
        userId: user.sub,
        projectId: project.id,
        role: ProjectRole.OWNER,
      },
    });

    return project;
  }

  async findAll(user: any) {
    if (user.role === SystemRole.SUPER_ADMIN) {
      return this.prisma.project.findMany({ where: { deletedAt: null } });
    }

    const adminGroups = await this.prisma.groupMember.findMany({
      where: {
        userId: user.sub,
        role: { in: [GroupRole.ADMIN, GroupRole.SUPERVISOR] },
        deletedAt: null,
      },
      select: { groupId: true },
    });
    const adminGroupIds = adminGroups.map((g) => g.groupId);

    const projectMemberships = await this.prisma.projectMember.findMany({
      where: { userId: user.sub, deletedAt: null },
      select: { projectId: true },
    });
    const memberProjectIds = projectMemberships.map((p) => p.projectId);

    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
        OR: [
          { groupId: { in: adminGroupIds } },
          { id: { in: memberProjectIds } },
        ],
      },
    });
  }

  async findOne(id: string, user: any) {
    const project = await this.prisma.project.findFirst({
      where: { id, deletedAt: null },
    });

    if (!project) throw new ApiError("Project not found", 404);

    if (user.role === SystemRole.SUPER_ADMIN) {
      return project;
    }

    const isGroupAdmin = await this.prisma.groupMember.findFirst({
      where: {
        userId: user.sub,
        groupId: project.groupId,
        role: { in: [GroupRole.ADMIN, GroupRole.SUPERVISOR] },
        deletedAt: null,
      },
    });

    if (isGroupAdmin) return project;

    const isProjectMember = await this.prisma.projectMember.findFirst({
      where: {
        userId: user.sub,
        projectId: id,
        deletedAt: null,
      },
    });

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

    const { projectName, description, deadline } = updateProjectDto;

    return this.prisma.project.update({
      where: { id },
      data: {
        ...(projectName && { projectName }),
        ...(description !== undefined && { description }),
        ...(deadline && { deadline: new Date(deadline) }),
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
