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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const calls_service_1 = require("./calls.service");
const create_campaign_dto_1 = require("./dto/create-campaign.dto");
const express_1 = require("express");
let CallsController = class CallsController {
    constructor(callsService) {
        this.callsService = callsService;
    }
    createCampaign(dto) {
        return this.callsService.createCampaign(dto);
    }
    listCampaigns() {
        return this.callsService.listCampaigns();
    }
    pauseCampaign(id) {
        return this.callsService.pauseCampaign(id);
    }
    resumeCampaign(id) {
        return this.callsService.resumeCampaign(id);
    }
    uploadContacts(id, file) {
        return this.callsService.uploadContacts(id, file.buffer, file.originalname);
    }
    triggerCall(id) {
        return this.callsService.triggerBolnaCall(id);
    }
    receiveBolnaWebhook(payload) {
        return this.callsService.handleWebhook(payload);
    }
};
exports.CallsController = CallsController;
__decorate([
    (0, common_1.Post)("campaigns"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_campaign_dto_1.CreateCampaignDto]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "createCampaign", null);
__decorate([
    (0, common_1.Get)("campaigns"),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "listCampaigns", null);
__decorate([
    (0, common_1.Patch)("campaigns/:id/pause"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "pauseCampaign", null);
__decorate([
    (0, common_1.Patch)("campaigns/:id/resume"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "resumeCampaign", null);
__decorate([
    (0, common_1.Post)("campaigns/:id/upload"),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)("file", { storage: (0, multer_1.memoryStorage)() })),
    __param(0, (0, common_1.Param)("id")),
    __param(1, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({ validators: [] }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, typeof (_b = typeof express_1.Express !== "undefined" && (_a = express_1.Express.Multer) !== void 0 && _a.File) === "function" ? _b : Object]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "uploadContacts", null);
__decorate([
    (0, common_1.Post)("contacts/:id/trigger"),
    __param(0, (0, common_1.Param)("id")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "triggerCall", null);
__decorate([
    (0, common_1.Post)("webhooks/bolna"),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CallsController.prototype, "receiveBolnaWebhook", null);
exports.CallsController = CallsController = __decorate([
    (0, common_1.Controller)("calls"),
    __metadata("design:paramtypes", [calls_service_1.CallsService])
], CallsController);
//# sourceMappingURL=calls.controller.js.map