import {
    IsNotEmpty,
    IsString,
    IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTagDTO {
    // Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Spotlight',
        description: 'Name',
        format: 'string'
    })
    name: string;

    product: [any];
    content: [any];
    order: [any];
    coupon: [any];
}

export class UpdateTagDTO {
    // Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Spotlight',
        description: 'Name',
        format: 'string'
    })
    name: string;
}

export class CreateManyTagDTO {
    // Name
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            {name: 'Spontant'}, 
            {name: 'Independent'}
        ],
        description: 'Name',
        format: 'array of object'
    })
    tags: [object];
}

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
