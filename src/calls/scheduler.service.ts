import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import dayjs = require("dayjs");
import { PrismaService } from "../prisma/prisma.service";
import { CallsService } from "./calls.service";

@Injectable()
export class CampaignSchedulerService {
  private readonly logger = new Logger(CampaignSchedulerService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly callsService: CallsService,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async processPendingCalls() {
    this.logger.log("Cron fired");

    const campaigns = await this.prisma.campaign.findMany({
      where: { isPaused: false, status: { in: ["SCHEDULED", "RUNNING"] } },
      include: { contacts: { where: { status: "PENDING" }, take: 5 } },
    });

    for (const campaign of campaigns) {
      const now = dayjs();

      const withinDateRange =
        now.isAfter(dayjs(campaign.startDate)) &&
        now.isBefore(dayjs(campaign.endDate).endOf("day"));

      const currentTime = now.format("HH:mm");
      const start = campaign.dailyStartTime;
      const end = campaign.dailyEndTime;

      const withinWindow =
        start <= end
          ? currentTime >= start && currentTime <= end
          : currentTime >= start || currentTime <= end;

      this.logger.log(
        `Campaign ${campaign.name} | current=${currentTime} | start=${start} | end=${end} | dateRange=${withinDateRange} | window=${withinWindow}`,
      );

      if (!withinDateRange || !withinWindow) continue;

      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "RUNNING" },
      });

      for (const contact of campaign.contacts) {
        try {
          await this.callsService.triggerBolnaCall(contact.id);
        } catch (error: any) {
          const errText = error?.response?.data
            ? JSON.stringify(error.response.data)
            : error?.message || "Unknown error";

          this.logger.error(`Call failed for ${contact.id}: ${errText}`);

          await this.prisma.contact.update({
            where: { id: contact.id },
            data: { status: "FAILED", lastError: errText },
          });
        }
      }
    }
  }
}
