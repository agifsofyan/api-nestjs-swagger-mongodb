import { IsNumber, Max } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateRatingDTO {
    // Rating
    @ApiProperty({
        example: 3,
        description: 'Rating with number value [1 - 5]',
        format: 'Number'
    })
    @IsNumber()
    @Max(5)
    rating: number;
}   