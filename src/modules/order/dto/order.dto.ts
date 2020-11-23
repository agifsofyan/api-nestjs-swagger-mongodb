import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SearchDTO {
    // Search
    @IsNotEmpty()
    @ApiProperty({
        example: "Product Marketplace",
        description: 'Search anything',
        format: 'string'
    })
    search: string;
}
