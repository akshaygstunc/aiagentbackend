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
var CampaignSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const dayjs = require("dayjs");
const prisma_service_1 = require("../prisma/prisma.service");
const calls_service_1 = require("./calls.service");
let CampaignSchedulerService = CampaignSchedulerService_1 = class CampaignSchedulerService {
    constructor(prisma, callsService) {
        this.prisma = prisma;
        this.callsService = callsService;
        this.logger = new common_1.Logger(CampaignSchedulerService_1.name);
    }
    async processPendingCalls() {
        const campaigns = await this.prisma.campaign.findMany({
            where: { isPaused: false, status: { in: ["SCHEDULED", "RUNNING"] } },
            include: { contacts: { where: { status: "PENDING" }, take: 5 } },
        });
        for (const campaign of campaigns) {
            const now = dayjs();
            const withinDateRange = now.isAfter(dayjs(campaign.startDate)) &&
                now.isBefore(dayjs(campaign.endDate).endOf("day"));
            const currentTime = now.format("HH:mm");
            const withinWindow = currentTime >= campaign.dailyStartTime &&
                currentTime <= campaign.dailyEndTime;
            if (!withinDateRange || !withinWindow)
                continue;
            await this.prisma.campaign.update({
                where: { id: campaign.id },
                data: { status: "RUNNING" },
            });
            for (const contact of campaign.contacts) {
                try {
                    await this.callsService.triggerBolnaCall(contact.id);
                }
                catch (error) {
                    console.log(error.response);
                    this.logger.error(`Call failed for ${contact.id}: ${error.response}`);
                    await this.prisma.contact.update({
                        where: { id: contact.id },
                        data: { status: "FAILED", lastError: error.message },
                    });
                }
            }
        }
    }
};
exports.CampaignSchedulerService = CampaignSchedulerService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_10_SECONDS),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CampaignSchedulerService.prototype, "processPendingCalls", null);
exports.CampaignSchedulerService = CampaignSchedulerService = CampaignSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        calls_service_1.CallsService])
], CampaignSchedulerService);
//# sourceMappingURL=scheduler.service.js.map