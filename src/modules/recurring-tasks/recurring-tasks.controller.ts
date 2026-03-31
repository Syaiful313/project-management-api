import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from "@nestjs/common";
import { RecurringTasksService } from "./recurring-tasks.service";
import { CreateRecurringTaskDto } from "./dto/create-recurring-task.dto";
import { UpdateRecurringTaskDto } from "./dto/update-recurring-task.dto";

@Controller("recurring-tasks")
export class RecurringTasksController {
  constructor(private readonly recurringTasksService: RecurringTasksService) {}

  @Post()
  create(@Body() createRecurringTaskDto: CreateRecurringTaskDto) {
    return this.recurringTasksService.create(createRecurringTaskDto);
  }

  @Get()
  findAll(@Query("groupId") groupId?: string) {
    return this.recurringTasksService.findAll(groupId);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.recurringTasksService.findOne(id);
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateRecurringTaskDto: UpdateRecurringTaskDto,
  ) {
    return this.recurringTasksService.update(id, updateRecurringTaskDto);
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.recurringTasksService.remove(id);
  }
}
