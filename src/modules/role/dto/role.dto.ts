import {
    IsNotEmpty,
    IsString,
    IsEnum,
    IsArray
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

//export enum AdminType { 
//	SALES = 'SALES', 
//	ADMIN = 'ADMIN',
//	CONTENT = 'CONTENT', 
//	FINANCE = 'FINANCE', 
//	MENTOR = 'MENTOR',
//	IT = 'IT', 
//	SUPERADMIN = 'SUPERADMIN',
//}

export class CreateRoleDTO {
    // Admin Type
    @IsNotEmpty()
    @IsString()
   // @IsEnum(AdminType, { message: 'Type value is: SALES | ADMIN | CONTENT | FINANCE | MENTOR | IT | SUPERADMIN' })
    @ApiProperty({
        example: 'supervisor',
        description: 'Admin Type',
        format: 'string',
        //enum: ['SALES', 'ADMIN', 'CONTENT', 'FINANCE', 'MENTOR', 'IT', 'SUPERADMIN']
    })
    // adminType: AdminType;
    adminType: string;

    @ApiProperty({
        example: false,
        description: 'Read Write',
        format: 'boolean'
    })
    readWrite: boolean;
}

export class UpdateRoleDTO extends PartialType(CreateRoleDTO) { }

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
        example: "Something",
        description: 'Search By Admin Type',
        format: 'string'
    })
    search: string;
}
