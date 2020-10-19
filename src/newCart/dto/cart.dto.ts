import { IsNotEmpty } from 'class-validator';

export class addCartDTO {
  @IsNotEmpty()
  product_id: string;
}

export class modifyCartDto {
	items: [{
		product_id: string;
		variant: string;
		quantity: number;
		note: string;
		shipment_id: string;
		coupon_id: string;
	}];
}