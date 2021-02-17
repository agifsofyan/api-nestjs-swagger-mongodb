import {
    IsNotEmpty,
    IsString,
    IsNumber,
    IsArray,
    IsEnum,
    Max,
    Min
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

    code: string;

    // Value
    @IsNotEmpty()
    @IsNumber()
    @ApiProperty({
        example: 5,
        description: 'Coupon Value (in percent %)',
        format: 'number',
        minimum: 1,
        maximum: 100,
        required: true
    })
    @Min(1)
    @Max(100)
    value: number;

    // Max Discount
    @ApiProperty({
        example: 30000,
        description: 'maximum coupons can be used. In Rp.',
        format: 'number',
        required: true
    })
    max_discount: number;

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

    // tag
    @IsArray()
    @ApiProperty({
        example: ['spotlight', 'spontant'],
        description: 'tags',
        format: 'string in array'
    })
    tag: [string];
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
