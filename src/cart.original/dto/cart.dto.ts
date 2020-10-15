import { IsNotEmpty } from 'class-validator';

export class CartDTO {
  @IsNotEmpty()
  id: string;
}