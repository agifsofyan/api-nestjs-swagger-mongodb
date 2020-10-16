import { IsNotEmpty } from 'class-validator';

export class addCartDTO {
  @IsNotEmpty()
  id: string;
}

export class modifyCartDto {
  variant: string;
  qty: number;
  note: string;
  shipment: string;
  coupon: string;
}