import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UniqueGenerateDto {
    // Generate Unique Number
    @ApiProperty({
        example: '5fb24fc4c49a9f4adc62bceb',
        description: 'Generate Unique Number to order',
        format: 'string'
    })
    @IsString()
    @IsNotEmpty()
    order_id: string;
}