import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from "@nestjs/common";
import { ProjectsService } from "./projects.service";
import { CreateProjectDto } from "./dto/create-project.dto";
import { UpdateProjectDto } from "./dto/update-project.dto";

@Controller("projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  create(@Body() createProjectDto: CreateProjectDto) {
    // TODO: Get creatorId from authenticated user (e.g., from request or a custom decorator)
    const creatorId = "c5c8a3c8-3e5f-4222-a7d0-1b2c3d4e5f6a"; // Placeholder user ID
    return this.projectsService.create(createProjectDto, creatorId);
  }

  @Get()
  findAll() {
    return this.projectsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.projectsService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsService.update(id, updateProjectDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.projectsService.remove(id);
  }
}
