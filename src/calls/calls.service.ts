import { BadRequestException, Injectable } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { firstValueFrom } from "rxjs";
import { Readable } from "stream";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
// import * as ExcelJS from "exceljs";
import * as XLSX from "xlsx";

@Injectable()
export class CallsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async createCampaign(dto: CreateCampaignDto) {
    return this.prisma.campaign.create({
      data: {
        name: dto.name,
        dailyStartTime: dto.dailyStartTime,
        dailyEndTime: dto.dailyEndTime,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
        bolnaAgentId:
          dto.bolnaAgentId || this.config.get<string>("BOLNA_AGENT_ID")!,
        fromNumber:
          dto.fromNumber || this.config.get<string>("BOLNA_FROM_NUMBER"),
        timezone: dto.timezone || "Asia/Kolkata",
        status: "SCHEDULED",
      },
    });
  }

  async listCampaigns() {
    return this.prisma.campaign.findMany({
      include: { contacts: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async pauseCampaign(id: string) {
    return this.prisma.campaign.update({
      where: { id },
      data: { isPaused: true, status: "PAUSED" },
    });
  }

  async resumeCampaign(id: string) {
    return this.prisma.campaign.update({
      where: { id },
      data: { isPaused: false, status: "RUNNING" },
    });
  }

  async uploadContacts(
    campaignId: string,
    buffer: Buffer,
    originalName: string,
  ) {
    const fileName = (originalName || "").toLowerCase();

    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".csv")) {
      throw new BadRequestException("Only .xlsx and .csv files are supported");
    }

    let workbook: XLSX.WorkBook;

    try {
      workbook = XLSX.read(buffer, {
        type: "buffer",
        raw: false,
        cellDates: true,
      });
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to parse uploaded file: ${error.message}`,
      );
    }

    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) {
      throw new BadRequestException("No sheet found in uploaded file");
    }

    const sheet = workbook.Sheets[firstSheetName];
    if (!sheet) {
      throw new BadRequestException("Sheet missing in uploaded file");
    }

    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
      defval: "",
    });

    if (!rows.length) {
      throw new BadRequestException("No contacts found in file");
    }

    const contacts: any[] = [];

    for (const row of rows) {
      const normalized: Record<string, any> = {};
      for (const key of Object.keys(row)) {
        normalized[String(key).trim().toLowerCase()] = row[key];
      }

      const phone = String(
        normalized.phone || normalized.mobile || normalized.number || "",
      ).trim();

      if (!phone) continue;

      contacts.push({
        campaignId,
        name: String(normalized.name || "").trim() || null,
        phone,
        email: String(normalized.email || "").trim() || null,
        company: String(normalized.company || "").trim() || null,
        metadataJson: JSON.stringify(row),
      });
    }

    if (!contacts.length) {
      throw new BadRequestException("No valid contacts found in file");
    }

    await this.prisma.contact.createMany({
      data: contacts,
    });

    return { inserted: contacts.length };
  }

  async triggerBolnaCall(contactId: string) {
    const contact = await this.prisma.contact.findUnique({
      where: { id: contactId },
      include: { campaign: true },
    });

    if (!contact) throw new BadRequestException("Contact not found");
    if (contact.campaign.isPaused)
      return { skipped: true, reason: "Campaign paused" };

    const payload: Record<string, any> = {
      agent_id: "d6c01441-a0e5-49ad-863e-853e4e20f58f",
      recipient_phone_number: `+91${contact.phone}`,
      user_data: {
        name: contact.name,
        email: contact.email,
      },
    };

    // if (contact.campaign.fromNumber) {
    //   payload.from_phone_number = contact.campaign.fromNumber;
    // }

    const response = await firstValueFrom(
      this.http.post("https://api.bolna.ai/call", payload, {
        headers: {
          Authorization: `Bearer ${this.config.get<string>("BOLNA_API_KEY")}`,
          "Content-Type": "application/json",
        },
      }),
    );

    await this.prisma.contact.update({
      where: { id: contact.id },
      data: {
        status: "QUEUED",
        bolnaExecutionId: response.data.execution_id,
        scheduledAt: new Date(),
      },
    });

    return response.data;
  }

  async handleWebhook(payload: any) {
    const executionId = payload?.execution_id || payload?.call_id;
    if (!executionId) return { ignored: true };

    const statusMap: Record<string, any> = {
      queued: "QUEUED",
      "in-progress": "CALLING",
      completed: "COMPLETED",
      failed: "FAILED",
    };

    await this.prisma.contact.updateMany({
      where: { bolnaExecutionId: executionId },
      data: {
        status: statusMap[payload.status] || "PENDING",
        lastError: payload.error || null,
      },
    });

    return { ok: true };
  }
}
