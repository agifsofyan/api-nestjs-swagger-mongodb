import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetImgModuleDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/generals/module/module_img.jpg',
        description: 'Image in LMS Module',
        format: 'string'
    })
    image_module: string;
}