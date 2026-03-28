import { Body, Controller, Get, Post } from "@nestjs/common";
import { SampleService } from "./sample.service";
import { CreateSampleDTO } from "./dto/create-sample.dto";

@Controller("samples")
export class SampleController {
  constructor(private readonly sampleService: SampleService) {}

  @Get()
  async getSamples() {
    return await this.sampleService.getSamples();
  }

  @Post()
  async createSample(@Body() body: CreateSampleDTO) {
    return await this.sampleService.createSample(body);
  }
}
