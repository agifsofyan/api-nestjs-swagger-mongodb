import {
    IsArray,
    IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UtmSettingDTO {
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            {name: 'origin', status: 'publish'},
            {name: 'facebook', status: 'publish'},
            {name: 'twitter', status: 'draft'},
        ],
        description: 'UTM List',
        format: 'array of Object'
    })
    utm: [{name: string, status: string}];
}