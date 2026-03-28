import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateSampleDTO } from "./dto/create-sample.dto";

@Injectable()
export class SampleService {
  constructor(private readonly prisma: PrismaService) {}

  async getSamples() {
    return await this.prisma.sample.findMany();
  }

  async createSample(body: CreateSampleDTO) {
    return await this.prisma.sample.create({ data: body });
  }
}
