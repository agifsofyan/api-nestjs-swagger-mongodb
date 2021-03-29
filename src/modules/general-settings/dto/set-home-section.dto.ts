import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetHomeSectionDto {    
    // General Setting
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['https://laruno-connect.s3.ap-southeast-1.amazonaws.com/ASSETS/icons/laruno_logo.png', 'https://laruno-connect.s3.ap-southeast-1.amazonaws.com/ASSETS/icons/laruno_logo.png'],
        description: 'image URL as Section Image',
        format: 'array string'
    })
    image: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/wamarketing.mp4',
        description: 'Video URL as section video',
        format: 'string'
    })
    video: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '602dda671e352b12bc226dfd',
        description: 'Product ID as from action to select product',
        format: 'string'
    })
    product_id: string;
}