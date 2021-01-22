import {
    IsNotEmpty,
    MinLength,
    IsString,
    IsEnum,
    IsArray,
    IsObject
} from 'class-validator';
// import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum bankAvailable  {
	BCA = 'BCA',
	BNI = 'BNI',
}

export class TransferConfirmDTO {
    // Tanggal Transfer
    @ApiProperty({
	example: '10:21:21TZ10:20:03',
	description: 'Transfer Date',
	format: 'string'
    })
    transfer_date;

    // Bank Name
    //@IsNotEmpty()
    //@IsString()
    @ApiProperty({
        example: 'BCA',
        description: 'Bank Name',
        format: 'string'
    })
    bank_name: string;

    // Account Owner Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Captain Marshall',
        description: 'Account Name',
        format: 'string'
    })
    account_owner_name: string;

    // Account Number
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @ApiProperty({
        example: '8010225501',
        description: 'Account Number',
        format: 'string',
	minLength: 10
    })
    account_number: string;

    // Destination Bank
    //@IsNotEmpty()
    //@IsString()
    @IsEnum(bankAvailable, { message: 'Type value is: BCA | BNI' })
    @ApiProperty({
        example: 'BCA',
        description: 'Destination Bank',
        format: 'enum string',
	enum: ['BCA', 'BNI']
    })
    destination_bank: string;

    // Invoice Number
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '1234SKU2012489',
        description: 'Invoice Number',
        format: 'string'
    })
    invoice_number: string;

    // struct_url
    @ApiProperty({
        example: 'https://laruno/image/sample-image-struct-url.png',
        description: 'Struct Url (url to get struct file)',
        format: 'string'
    })
    struct_url: string;

    // is_confirmed
}
