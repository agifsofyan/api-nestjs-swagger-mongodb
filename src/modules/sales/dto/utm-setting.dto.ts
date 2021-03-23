import {
    IsEnum,
    IsNotEmpty,
    IsString
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum UtmStatusValue {
    PUBLISH='publish',
    DRAFT='draft',
}

export class UtmSettingDTO {
    @ApiProperty({
        example: 'origin',
        description: 'UTM Name',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    name: string;

    @ApiProperty({
        example: 'publish',
        description: 'UTM Status',
        enum: UtmStatusValue,
        format: 'enum string'
    })
    @IsNotEmpty()
    @IsString()
    @IsEnum(UtmStatusValue, { message: 'status value is: publish, draft' })
    status: UtmStatusValue;
}