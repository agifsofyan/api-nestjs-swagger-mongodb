import { IsNotEmpty, IsObject } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetGeneralDto {    
    // General Setting
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "https://laruno-connect.s3.ap-southeast-1.amazonaws.com/ASSETS/icons/laruno_logo.png",
            note: "40x40",
	    },
        description: 'Logo Image',
        format: 'object'
    })
    logo: {
        value: String,
        note: String,
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/icons/laruno_logo.png",
            note: "16x16",
	    },
        description: 'Favicon icon',
        format: 'object'
    })
    favicon: {
        value: String,
        note: String,
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "Laruno",
            note: "Mencerdaskan Bangsa",
	    },
        description: 'Site Title',
        format: 'object'
    })
    site_title: {
        value: String,
        note: String
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "Ruko Darwin No. 6 Pagedangan",
            note: "Office Address",
	    },
        description: 'Address',
        format: 'object'
    })
    address: {
        value: String,
        note: String
    };
    
    // @IsNotEmpty()
    // @IsObject()
    @ApiProperty({
        example: { 
            value: "087878500139",
            note: "Customer Service",
	    },
        description: 'Whatsapp Number',
        format: 'object'
    })
    whatsapp: {
        value: String,
        note: String
    };
}