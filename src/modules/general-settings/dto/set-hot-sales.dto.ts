import { IsArray, IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SetOnHeaderDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Promo spesial',
        description: 'Content (Headline/title)',
        format: 'array string'
    })
    content: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Mau tau benefit member premium ? cukup Rp. 20.000,-/bulan. Cek disini sekarang',
        description: 'Cta Text (Description)',
        format: 'string'
    })
    ctatext: string;
    
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'https://laruno.id/product-detail/investasi-emas',
        description: 'URL Link',
        format: 'string'
    })
    ctalink: string;
}

export class SetOnPageDto {
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            {product: '602dd99fb3d86020f078e0a0'},
            {product: '602ddc029d12df001cc212a5'}
        ],
        description: 'Products On Page',
        format: 'array of Object'
    })
    on_page: [{product: string}];
}

export class SetOnContentDto {
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [{
            type: 'fulfillment',
            content: 'Promo akhir bulan',
            ctatext: 'Mau tau bonus di akhir bulan ? dapat diskon Rp. 100.000,-. Cek disini sekarang',
            ctalink: 'https://laruno.id/product-detail/produk-boe?utm=origin'
        },{
            type: 'blog',
            content: 'Promo akhir bulan',
            ctatext: 'Mau tau bonus di akhir bulan ? dapat diskon Rp. 100.000,-. Cek disini sekarang',
            ctalink: 'https://laruno.id/product-detail/produk-boe?utm=origin'
        }],
        description: 'On Content',
        format: 'array of Object'
    })
    on_content: [{
        type: string,
        content: string,
        ctatext: string,
        ctalink: string
    }];
}