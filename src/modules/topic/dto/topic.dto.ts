import {
    IsNotEmpty,
    IsString,
    IsArray
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum Sort {
	asc = 'asc',
	desc = 'desc'
}

export class CreateTopicDTO {
    // Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Career',
        description: 'Name',
        format: 'string'
    })
    name: string;

    // Icon
    @ApiProperty({
        example: 'http://dummy.com/image/icons.ico',
        description: 'Icon',
        format: 'string'
    })
    icon: string;
}

export class UpdateTopicDTO extends PartialType(CreateTopicDTO) { }

export class ArrayIdDTO {
    // Delete multiple ID or Clone Multiple Id
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['5f699e87b92fbe5320a35a93', '5f699e8bb92fbe5320a35a94'],
        description: 'Id',
        format: 'array'
    })
    id: string[];
}

export class SearchDTO {
    // Search
    @IsNotEmpty()
    @ApiProperty({
        example: "Career",
        description: 'Search By Name',
        format: 'string'
    })
    search: string;
}
