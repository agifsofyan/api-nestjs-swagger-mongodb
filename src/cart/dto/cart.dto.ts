import { IsNotEmpty } from 'class-validator';

export class CartUpdateDTO {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  items?: string;
}