"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const rxjs_1 = require("rxjs");
const prisma_service_1 = require("../prisma/prisma.service");
const XLSX = require("xlsx");
let CallsService = class CallsService {
    constructor(prisma, http, config) {
        this.prisma = prisma;
        this.http = http;
        this.config = config;
    }
    async createCampaign(dto) {
        return this.prisma.campaign.create({
            data: {
                name: dto.name,
                dailyStartTime: dto.dailyStartTime,
                dailyEndTime: dto.dailyEndTime,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                bolnaAgentId: dto.bolnaAgentId || this.config.get("BOLNA_AGENT_ID"),
                fromNumber: dto.fromNumber || this.config.get("BOLNA_FROM_NUMBER"),
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
    async pauseCampaign(id) {
        return this.prisma.campaign.update({
            where: { id },
            data: { isPaused: true, status: "PAUSED" },
        });
    }
    async resumeCampaign(id) {
        return this.prisma.campaign.update({
            where: { id },
            data: { isPaused: false, status: "RUNNING" },
        });
    }
    async uploadContacts(campaignId, buffer, originalName) {
        const fileName = (originalName || "").toLowerCase();
        if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".csv")) {
            throw new common_1.BadRequestException("Only .xlsx and .csv files are supported");
        }
        let workbook;
        try {
            workbook = XLSX.read(buffer, {
                type: "buffer",
                raw: false,
                cellDates: true,
            });
        }
        catch (error) {
            throw new common_1.BadRequestException(`Failed to parse uploaded file: ${error.message}`);
        }
        const firstSheetName = workbook.SheetNames[0];
        if (!firstSheetName) {
            throw new common_1.BadRequestException("No sheet found in uploaded file");
        }
        const sheet = workbook.Sheets[firstSheetName];
        if (!sheet) {
            throw new common_1.BadRequestException("Sheet missing in uploaded file");
        }
        const rows = XLSX.utils.sheet_to_json(sheet, {
            defval: "",
        });
        if (!rows.length) {
            throw new common_1.BadRequestException("No contacts found in file");
        }
        const contacts = [];
        for (const row of rows) {
            const normalized = {};
            for (const key of Object.keys(row)) {
                normalized[String(key).trim().toLowerCase()] = row[key];
            }
            const phone = String(normalized.phone || normalized.mobile || normalized.number || "").trim();
            if (!phone)
                continue;
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
            throw new common_1.BadRequestException("No valid contacts found in file");
        }
        await this.prisma.contact.createMany({
            data: contacts,
        });
        return { inserted: contacts.length };
    }
    async triggerBolnaCall(contactId) {
        const contact = await this.prisma.contact.findUnique({
            where: { id: contactId },
            include: { campaign: true },
        });
        if (!contact)
            throw new common_1.BadRequestException("Contact not found");
        if (contact.campaign.isPaused)
            return { skipped: true, reason: "Campaign paused" };
        const payload = {
            agent_id: "d6c01441-a0e5-49ad-863e-853e4e20f58f",
            recipient_phone_number: `+91${contact.phone}`,
            user_data: {
                name: contact.name,
                email: contact.email,
            },
        };
        const response = await (0, rxjs_1.firstValueFrom)(this.http.post("https://api.bolna.ai/call", payload, {
            headers: {
                Authorization: `Bearer ${this.config.get("BOLNA_API_KEY")}`,
                "Content-Type": "application/json",
            },
        }));
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
    async handleWebhook(payload) {
        const executionId = payload?.execution_id || payload?.call_id;
        if (!executionId)
            return { ignored: true };
        const statusMap = {
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
};
exports.CallsService = CallsService;
exports.CallsService = CallsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        axios_1.HttpService,
        config_1.ConfigService])
], CallsService);
//# sourceMappingURL=calls.service.js.map