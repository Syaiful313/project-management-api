import { Module } from "@nestjs/common";
import { RecurringTasksController } from "./recurring-tasks.controller";
import { RecurringTasksService } from "./recurring-tasks.service";
import { RecurringTasksCron } from "./recurring-tasks.cron";

@Module({
  controllers: [RecurringTasksController],
  providers: [RecurringTasksService, RecurringTasksCron],
})
export class RecurringTasksModule {}
