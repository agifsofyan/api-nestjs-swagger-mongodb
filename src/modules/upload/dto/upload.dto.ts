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
    MEDIA_URL='media_url',
    BONUS='bonus',
    RESELLERS='resellers',
    GENERALS='generals',
    PROFILES='profiles',
}

export class MediaDTO {}