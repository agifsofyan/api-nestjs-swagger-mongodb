import { IsNotEmpty } from 'class-validator';

export class IdProductDTO {
  @IsNotEmpty()
  id: string;
}