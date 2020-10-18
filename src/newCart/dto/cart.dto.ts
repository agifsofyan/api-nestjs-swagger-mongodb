import { IsNotEmpty } from 'class-validator';

export class addCartDTO {
  @IsNotEmpty()
  product_id: string;
}

export class modifyCartDto {
	product_id: string;
	variant: string;
	quantity: number;
	note: string;
	shipment_id: string;
	whenAdd: Date;
	whenExpired: Date;
	isActive: boolean;
	coupon_id: string;
}