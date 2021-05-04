import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum,
    IsNumber,
    IsBoolean
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum PlacementContent {
    STORIES='stories',
    SPOTLIGHT='spotlight',
}

export enum ContentType {
    BLOG='blog',
    FULFILMENT='fulfilment',
}

export enum ContentKind {
    WEBINAR='webinar',
    VIDEO='video',
    TIPS='tips',
}

export enum MediaType {
    IMAGES='images',
    VIDEO='video',
    PODCAST='podcast',
}

export enum ModuleType {
    ACTION='action',
    QUESTION='question',
    MISSION='mission',
    MINDMAP='mindmap',
}

export class SendAnswerDTO {
    // answer
    @ApiProperty({
        example: 'answer the question is possible to the best',
        description: 'answer the question',
        format: 'string'
    })
    @IsString()
    @IsNotEmpty()
    answer: number;

    user: string;
    datetime: Date;
}

export class SendMissionDTO {
    // mission id
    @ApiProperty({
        example: '6034e7a5ed1ee1608cfb1d85',
        description: 'Mission ID from module in content',
        format: 'string'
    })
    @IsString()
    @IsNotEmpty()
    mission_id:string;

    // claim of mission
    @ApiProperty({
        example: true,
        description: 'mission complete',
        format: 'boolean',
        default: true
    })
    @IsBoolean()
    @IsNotEmpty()
    done: boolean;
}