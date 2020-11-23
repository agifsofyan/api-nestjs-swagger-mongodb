import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum CouponType {
    Product = 'Product',
    User = 'User',
    Event = 'Event',
    Payment = 'Payment'
}

export class CreateCouponDTO {
    // Name
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'FRDANA',
        description: 'Coupon Name',
        format: 'string'
    })
    name: string;

    // Code
    /**
    @ApiProperty({
        example: 'FRD',
        description: 'Coupon Code',
        format: 'string'
    })
    */
    code: string;

    // Value
    @IsNotEmpty()
    // @IsString()
    @ApiProperty({
        example: '80',
        description: 'Coupon Value (in percent %)',
        format: 'number'
    })
    value: number;

    // Start Date
    @IsNotEmpty()
    @ApiProperty({
        example: '2020-09-16T04:12:54.173Z',
        description: 'Start Date Coupon Active',
        format: 'date'
    })
    start_date: string;

    // End Date
    @IsNotEmpty()
    @ApiProperty({
        example: '2020-09-16T04:12:54.173Z',
        description: 'End Date Coupon Active',
        format: 'date'
    })
    end_date: string;

    // Max Discount
    @ApiProperty({
        example: 2,
        description: 'maximum coupons can be used',
        format: 'number'
    })
    max_discount: number;

    // Payment Method
    @ApiProperty({
        example: '5f96930b970708276038afe4 ref from payment method',
        description: 'Payment Method',
        format: 'string'
    })
    payment_method: string;

    // Coupon type
    @IsNotEmpty()
    @IsString()
    @IsEnum(CouponType, { message: 'Type value is: Product, User, Event, Payment' })
    @ApiProperty({
        example: 'Product',
        description: 'Coupon type, available in [Product, User, Event]',
        format: 'string',
	    enum: ['Product', 'User', 'Event', 'Payment'],
	    default: 'Product'
    })
    type: CouponType;

    @ApiProperty({
	example: 'xxxxxxx ref from product_id',
	description: 'Product Id',
	format: 'string'
    })
    product_id: string;
}

export class UpdateCouponDTO extends PartialType(CreateCouponDTO) { }

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
        example: "FRDANA",
        description: 'Search By Name',
        format: 'string'
    })
    search: string;
}
