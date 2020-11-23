import {
    IsNotEmpty,
    IsString,
    IsArray
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateFollowUpDTO {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Follow Up Easy',
        description: 'Name',
        format: 'string'
    })
    name: string;

    @ApiProperty({
        example: 'Template in here',
        description: 'Template',
        format: 'string'
    })
    template: string;

    @ApiProperty({
	example: 'WA',
	description: 'Type',
	format: 'string',
    })
    type: string;

    by: string;
}

export class UpdateFollowUpDTO extends PartialType(CreateFollowUpDTO) { }

export class ArrayIdDTO {
    // Delete multiple ID or Clone Multiple Id
    @IsNotEmpty()
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
        example: "Something",
        description: 'Search By Name',
        format: 'string'
    })
    search: string;
}
