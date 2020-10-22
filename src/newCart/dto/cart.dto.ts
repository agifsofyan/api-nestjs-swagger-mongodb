import { IsNotEmpty } from 'class-validator';

export class addCartDTO {
  @IsNotEmpty()
  product_id: string;
}