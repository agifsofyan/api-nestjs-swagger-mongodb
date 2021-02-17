import {
    IsNotEmpty,
    IsString,
    IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TagType {
    PRODUCT='product',
    ORDER='order',
    CONTENT='content',
    COUPON='coupon',
}

export class CreateTagDTO {
    // Name
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            {name: "facebook"},
            {name: "sales"},
        ],
        description: 'Name',
        format: 'string'
    })

    tags: [{
        name: string;
        product: [any];
        content: [any];
        order: [any];
        coupon: [any];
    }]
}

// export class CreateTagDTO {
//     // Name
//     @IsNotEmpty()
//     @IsString()
//     @ApiProperty({
//         example: 'Spotlight',
//         description: 'Name',
//         format: 'string'
//     })
//     name: string;

//     product: [any];
//     content: [any];
//     order: [any];
//     coupon: [any];
// }

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
