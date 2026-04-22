import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCampaignDto {
  @IsString() @IsNotEmpty()
  name: string;

  @IsString() @IsNotEmpty()
  dailyStartTime: string;

  @IsString() @IsNotEmpty()
  dailyEndTime: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional() @IsString()
  bolnaAgentId?: string;

  @IsOptional() @IsString()
  fromNumber?: string;

  @IsOptional() @IsString()
  timezone?: string;
}
