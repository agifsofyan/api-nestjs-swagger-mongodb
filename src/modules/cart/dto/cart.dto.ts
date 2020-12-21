import { IsArray, IsNotEmpty } from 'class-validator';
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

export class arrayIdDTO {
    // Delete multiple ID or Clone Multiple Id
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['5fc721a51712590aa05641b5', '5fc721931712590aa05641b1'],
        description: 'Product Id',
        format: 'array'
    })
    product_id: string[];
}
