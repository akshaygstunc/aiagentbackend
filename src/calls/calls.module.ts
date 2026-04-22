import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CallsController } from './calls.controller';
import { CallsService } from './calls.service';
import { CampaignSchedulerService } from './scheduler.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [HttpModule],
  controllers: [CallsController],
  providers: [CallsService, CampaignSchedulerService, PrismaService],
})
export class CallsModule {}
