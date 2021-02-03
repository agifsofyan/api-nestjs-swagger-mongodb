import { IsNotEmpty, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateZoomWebinar {
    @ApiProperty({
        example: 'asdlcmdknbcjsbgjhsgjscs',
        description: 'Host ID',
        format: "String"
    })
    @IsNotEmpty()
    @IsString()
    host_id: string

    @ApiProperty({
        example: 'Meetup Motivation',
        description: 'Topic',
        format: "String"
    })
    @IsNotEmpty()
    @IsString()
    topic: string

    @ApiProperty({
        example: 1,
        description: 'Type',
        format: 'number',
    })
    @IsNotEmpty()
    @IsNumber()
    type: number
}
