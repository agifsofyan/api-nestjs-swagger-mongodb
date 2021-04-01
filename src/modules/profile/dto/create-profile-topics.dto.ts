import { IsArray, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ProfileFavoriteTopicsDTO {
    // Favorite Topics
    @ApiProperty({
        example: ['5f87cd2b8f81060165f1de63', '5fb636b3f5cdfe00749e0b05', '5fb637acf5cdfe00749e0b09', '5fb63d5ff5cdfe00749e0b15'],
        description: 'Favorite Topics',
        format: 'aray string',
    })
    @IsArray()
    @IsNotEmpty()
    favorite_topics: string;
}