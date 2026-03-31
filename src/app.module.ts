import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_FILTER } from "@nestjs/core";
import { LoggerModule } from "nestjs-pino";
import { randomUUID } from "crypto";
import { ApiErrorFilter } from "./common/filters/api-error.filter";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProjectsModule } from "./modules/projects/projects.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: () => randomUUID(),
        customLogLevel: (_req, res, err) => {
          if (err || res.statusCode >= 500) return "error";
          if (res.statusCode >= 400) return "warn";
          return "info";
        },
        serializers: {
          req(req) {
            return { method: req.method, url: req.url, reqId: req.id };
          },
          res(res) {
            return { statusCode: res.statusCode };
          },
        },
        transport:
          process.env.NODE_ENV !== "production"
            ? {
                target: "pino-pretty",
                options: {
                  colorize: true,
                  translateTime: "yyyy-mm-dd HH:MM:ss",
                  singleLine: true,
                },
              }
            : undefined,
        level: process.env.NODE_ENV === "production" ? "info" : "debug",
      },
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: ApiErrorFilter,
    },
  ],
})
export class AppModule {}
