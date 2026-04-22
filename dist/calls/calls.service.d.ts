import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
export declare class CallsService {
    private readonly prisma;
    private readonly http;
    private readonly config;
    constructor(prisma: PrismaService, http: HttpService, config: ConfigService);
    createCampaign(dto: CreateCampaignDto): Promise<{
        id: string;
        name: string;
        bolnaAgentId: string;
        fromNumber: string | null;
        timezone: string;
        dailyStartTime: string;
        dailyEndTime: string;
        startDate: Date;
        endDate: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        isPaused: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listCampaigns(): Promise<({
        contacts: {
            id: string;
            name: string | null;
            status: import(".prisma/client").$Enums.ContactStatus;
            createdAt: Date;
            updatedAt: Date;
            campaignId: string;
            phone: string;
            email: string | null;
            company: string | null;
            metadataJson: string | null;
            scheduledAt: Date | null;
            bolnaExecutionId: string | null;
            lastError: string | null;
        }[];
    } & {
        id: string;
        name: string;
        bolnaAgentId: string;
        fromNumber: string | null;
        timezone: string;
        dailyStartTime: string;
        dailyEndTime: string;
        startDate: Date;
        endDate: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        isPaused: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    pauseCampaign(id: string): Promise<{
        id: string;
        name: string;
        bolnaAgentId: string;
        fromNumber: string | null;
        timezone: string;
        dailyStartTime: string;
        dailyEndTime: string;
        startDate: Date;
        endDate: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        isPaused: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    resumeCampaign(id: string): Promise<{
        id: string;
        name: string;
        bolnaAgentId: string;
        fromNumber: string | null;
        timezone: string;
        dailyStartTime: string;
        dailyEndTime: string;
        startDate: Date;
        endDate: Date;
        status: import(".prisma/client").$Enums.CampaignStatus;
        isPaused: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadContacts(campaignId: string, buffer: Buffer, originalName: string): Promise<{
        inserted: number;
    }>;
    triggerBolnaCall(contactId: string): Promise<any>;
    handleWebhook(payload: any): Promise<{
        ignored: boolean;
        ok?: undefined;
    } | {
        ok: boolean;
        ignored?: undefined;
    }>;
}
