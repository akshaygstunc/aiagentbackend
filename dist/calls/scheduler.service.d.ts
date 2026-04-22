import { PrismaService } from "../prisma/prisma.service";
import { CallsService } from "./calls.service";
export declare class CampaignSchedulerService {
    private readonly prisma;
    private readonly callsService;
    private readonly logger;
    constructor(prisma: PrismaService, callsService: CallsService);
    processPendingCalls(): Promise<void>;
}
