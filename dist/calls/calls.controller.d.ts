import { CallsService } from "./calls.service";
import { CreateCampaignDto } from "./dto/create-campaign.dto";
import { Express } from "express";
export declare class CallsController {
    private readonly callsService;
    constructor(callsService: CallsService);
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
    uploadContacts(id: string, file: Express.Multer.File): Promise<{
        inserted: number;
    }>;
    triggerCall(id: string): Promise<any>;
    receiveBolnaWebhook(payload: any): Promise<{
        ignored: boolean;
        ok?: undefined;
    } | {
        ok: boolean;
        ignored?: undefined;
    }>;
}
