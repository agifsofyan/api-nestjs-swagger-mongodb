import { IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class addCartDTO {
  @IsNotEmpty()
  @ApiProperty({
      example: '5f7c3174d623b700b9b751b7',
      description: 'Product Id',
      format: 'string'
  })
  product_id: string;
}

export class ArrayIdDTO {
    // Delete multiple ID or Clone Multiple Id
    @IsNotEmpty()
    @ApiProperty({
        example: ['5f699e87b92fbe5320a35a93', '5f699e8bb92fbe5320a35a94'],
        description: 'Product Id',
        format: 'array'
    })
    product_id: string[];
}
