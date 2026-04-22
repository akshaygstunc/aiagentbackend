import {
  Body,
  Controller,
  Get,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { CallsService } from "./calls.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { Express } from "express";
@Controller("calls")
export class CallsController {
  constructor(private readonly callsService: CallsService) {}

  @Post("campaigns")
  createCampaign(@Body() dto: CreateCampaignDto) {
    return this.callsService.createCampaign(dto);
  }

  @Get("campaigns")
  listCampaigns() {
    return this.callsService.listCampaigns();
  }

  @Patch("campaigns/:id/pause")
  pauseCampaign(@Param("id") id: string) {
    return this.callsService.pauseCampaign(id);
  }

  @Patch("campaigns/:id/resume")
  resumeCampaign(@Param("id") id: string) {
    return this.callsService.resumeCampaign(id);
  }

  @Post("campaigns/:id/upload")
  @UseInterceptors(FileInterceptor("file", { storage: memoryStorage() }))
  uploadContacts(
    @Param("id") id: string,
    @UploadedFile(new ParseFilePipe({ validators: [] }))
    file: Express.Multer.File,
  ) {
    return this.callsService.uploadContacts(id, file.buffer, file.originalname);
  }
  @Post("contacts/:id/trigger")
  triggerCall(@Param("id") id: string) {
    return this.callsService.triggerBolnaCall(id);
  }

  @Post("webhooks/bolna")
  receiveBolnaWebhook(@Body() payload: any) {
    return this.callsService.handleWebhook(payload);
  }
}
