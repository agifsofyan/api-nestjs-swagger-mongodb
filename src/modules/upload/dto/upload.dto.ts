import {
    IsNotEmpty,
    IsEmail,
    IsString,
    MinLength
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum PathMediaDTO {
    PRODUCTS='products',
    CONTENTS='contents',
    TOPICS='topics',
    PAYMENT_METHODS='payment_methods',
    TRANSFERS='transfers',
    RESELLERS='resellers',
    GENERALS='generals',
    USERS='users',
    ICONS='icons',
}

export enum SubPathMediaDTO {
    SECTION='section',
    BUMP='bump',
    IMAGE_URL='image_url',
    MEDIA='media',
    BONUS='bonus',
    RESELLERS='resellers',
    GENERALS='generals',
    PROFILES='profiles',
    MODULE='module'
}

export class MediaDTO {}