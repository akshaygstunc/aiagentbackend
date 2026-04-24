import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat = require("dayjs/plugin/customParseFormat");
// // 🔥 ADD THESE
// import utc from "dayjs/plugin/utc";
// import timezone from "dayjs/plugin/timezone";

import { PrismaService } from "../prisma/prisma.service";
import { CallsService } from "./calls.service";

// 🔥 ENABLE PLUGINS
dayjs?.extend(utc);
dayjs?.extend(timezone);
dayjs?.extend(customParseFormat);
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
      // ✅ FORCE IST TIME
      const now = dayjs().tz("Asia/Kolkata");

      // ✅ DATE CHECK (IST SAFE)
      const withinDateRange =
        now.isSame(dayjs(campaign.startDate), "day") ||
        now.isAfter(dayjs(campaign.startDate));

      const beforeEnd = now.isBefore(dayjs(campaign.endDate).endOf("day"));

      if (!withinDateRange || !beforeEnd) {
        this.logger.log(`❌ Date mismatch for ${campaign.name}`);
        continue;
      }

      // ✅ TIME CHECK (IST SAFE)
      const currentTime = now.format("HH:mm");

      // ensure both are HH:mm
      const start = dayjs(campaign.dailyStartTime, ["HH:mm", "hh:mm A"]).format(
        "HH:mm",
      );
      const end = dayjs(campaign.dailyEndTime, ["HH:mm", "hh:mm A"]).format(
        "HH:mm",
      );

      const withinWindow =
        start <= end
          ? currentTime >= start && currentTime <= end
          : currentTime >= start || currentTime <= end;

      this.logger.log(
        `Campaign ${campaign.name} | IST=${currentTime} | start=${start} | end=${end} | dateRange=${withinDateRange} | window=${withinWindow}`,
      );

      if (!withinWindow) {
        this.logger.log(`❌ Time window mismatch for ${campaign.name}`);
        continue;
      }

      // ✅ MARK RUNNING
      await this.prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: "RUNNING" },
      });

      // ✅ PROCESS CONTACTS
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
