import {
    IsNotEmpty,
    MinLength,
    IsString,
    IsEnum,
    IsArray,
    IsObject
} from 'class-validator';
// import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum EnumType {
	Boe = 'boe',
	Ecourse = 'ecourse',
	Ecommerce = 'ecommerce',
	Bonus = 'bonus',
}

export enum VisibilityEnum {
	Publish = 'publish',
    Private = 'private',
    Draft  = 'draft',
}

export enum SaleMethodEnum {
	Normal = 'normal',
	Upsale = 'upsale',
	Upgrade = 'upgrade',
	Crossale = 'crossale',
}

export class CreateProductDTO {
    // Type
    @IsEnum(EnumType, { message: 'Type value is: boe, ecourse, ecommerce, bonus' })
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'boe',
        description: 'Type',
        enum: ['boe', 'ecourse', 'ecommerce', 'bonus']
    })
    type: EnumType;

    // Name
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @ApiProperty({
        example: 'Bisnis Market Pasar Modal 2020',
        description: 'Name',
        format: 'string'
    })
    name: string;

    // Slug
    @ApiProperty({
        example: 'Bisnis Market 2020',
        description: 'Slug',
        format: 'string'
    })
    slug: string;

     // Product Code
     @ApiProperty({
         example: 'PMPM2',
         description: 'Name',
         format: 'string'
     })
     code: string;

    // Visibility
    @IsEnum(VisibilityEnum, { message: 'Type value is: publish, private, draft' })
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'publish',
        description: 'Visibility',
        enum: ['publish', 'private', 'draft'],
        default: 'publish'
    })
    visibility: VisibilityEnum;

    // Headline
    @ApiProperty({
        example: 'Bisnis Market to young generation',
        description: 'Headline',
        format: 'string'
    })
    headline: string;

    @ApiProperty({
        example: 'Bisnis minim modulation',
        description: 'Sub Headline',
        format: 'string'
    })
    subheadline: string;

    // Description
    @IsString()
    @MinLength(5)
    @ApiProperty({
        example: 'Bisnis Market to young generation in the world',
	    description: 'Full Description',
        format: 'string'
    })
    description: string;

    // Feedback (what you learn)
    @IsArray()
    @ApiProperty({
        example: [{
            'title': 'Whay you learn our',
            'content': 'in paragraph format like description',
            'note': 'something to noted',
        }],
	      description: 'Feedback (why your learn)',
        format: 'array object'
    })
    learn_about: [{ title: string, content: string, note: string }];

    // Time Periode
    @ApiProperty({
        example: 2,
        description: 'Time Periode (in month)',
        format: 'number'
    })
    time_period: number;

    // Price
    // @IsNotEmpty()
    @ApiProperty({
        example: 150000,
        description: 'Price',
        format: 'number'
    })
    price: number;

    // sale_price
    @ApiProperty({
        example: 100000,
        description: 'Sale Price',
        format: 'number'
    })
    sale_price: number;

    // Topic
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            "5f87cd2b8f81060165f1de63",
            "5fb639cdf5cdfe00749e0b0f"
        ],
        description: 'Select From Field Topic',
        format: 'array'
    })
    topic: string[]; // Topic from category table (collection)

    // boe
    // @IsObject()
    // @ApiProperty({
    // 	example: {
    //         date: "2020-09-16T04:12:54.173Z",
    //         duration: "01:59",
    //         start_time: "05:00",
    //         client_url: "https://zoom.us/j/2697925165?_x_zm_rtaid=58knpEjNRpOiZWECLYlkcA.1599641870607.036d146a5990bf44527a2edee2775bae&_x_zm_rhtaid=36#success",
    //     },
	//     description: 'boe Data',
	//     format: 'object string'
    // })
    // boe: {
    //     date: string,
    //     duration: string,
    //     start_time: string,
    //     end_time: string,
    //     client_url: string,
    //     beginTime: string,
    //     endTime: string,
    // };

//    Ecommerce
   @IsObject()
   @ApiProperty({
        example: {
            weight: 125,
            shipping_charges: true,
            stock: 10,
            is_regular: false
        },
        description: 'Ecommerce Data: {weight in gram}',
        format: 'object'
    })
    ecommerce: {
        weight: number,
        shipping_charges: boolean,
        stock: number,
        is_regular: boolean
    };

    // Sale Method / Upsale
    @IsEnum(SaleMethodEnum, { message: 'Type value is: normal, upsale, upgrade, crossale' })
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'normal',
        description: 'Upsale',
        enum: ['normal', 'upsale', 'upgrade', 'crossale'],
        default: 'normal'
    })
    sale_method: SaleMethodEnum;

    // Agent / Customer Service
    @IsArray()
    @ApiProperty({
        example: ["5fb82114a17a62ef49ca1fa1"],
        description: 'Id Agent / Customer Service',
        format: 'array'
    })
    agent: string[];

    // Image URL
    @IsArray()
    @ApiProperty({
        example: ["https://scontent.fcgk18-2.fna.fbcdn.net/v/t1.0-9/120352170_3862340120521750_2488050850786624061_o.jpg?_nc_cat=104&_nc_sid=a26aad&_nc_eui2=AeG4vbr4iHLG0oA-_vudn-yfEMiOq5c87k0QyI6rlzzuTbEtv7RS1tF5OfkTkET_nt_BqsXvxTyUc-pGYuxpQEcD&_nc_ohc=jUd3tKS55IEAX_aAL1Y&_nc_ht=scontent.fcgk18-2.fna&oh=cc49eae9763571016352d3cead2bad42&oe=5FA1AF30", "https://scontent.fcgk18-1.fna.fbcdn.net/v/t1.0-9/120200139_3853129554776140_5599571901852696024_o.jpg?_nc_cat=103&_nc_sid=a26aad&_nc_eui2=AeGrK6UCxbdXqWmIgssKJ7pzD6SYtvmupXQPpJi2-a6ldFaubuz02brHAsePiGufhB8hcME1CScGfyAL4hIKivj-&_nc_ohc=3RXgb3xP6l4AX_nQpOO&_nc_ht=scontent.fcgk18-1.fna&oh=7800fa293e2116e2d4069162408d13b7&oe=5FA2E678"],
        description: 'Image Url',
        format: 'array string'
    })
    image_url: [string];

    @IsObject()
    @IsNotEmpty()
    @ApiProperty({
        example: {
            image: "https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/freelance-business-women-casual-wear-using-tablet-working-call-video-conference-with-customer-workplace-living-room-home-happy-young-asian-girl-relax-sitting-desk-job-internet.jpg",
            title: "Bonus Title",
            description: "Bonus Description"
        },
        description: 'Bonus',
        format: 'object string'
    })
    bonus: {
        image: string;
        title: string;
        description: string;
    };

    // Image Text Url
    @ApiProperty({
        example: {
            isVideo: true,
            url: 'https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/videos/samplevideo_1280x720_5mb.mp4'
        },
        description: 'Media for image or video type',
        format: 'string'
    })
    media: {
        isVideo: boolean,
        url: string
    };

    // Section
    @IsArray()
    @ApiProperty({
        example: [{
            'title': "title in generate",
            'content': "Section in the paragraf of young generation in the world",
            'image': "https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/topics/images.jpg"
        }],
	    description: 'Section',
        format: 'array object'
    })
    section: [{ title: string, content: string, image: string }];

    // Bump
    @IsArray()
    @ApiProperty({
        example: [{
            "bump_name": "Product Order Bump 1",
            "bump_price": 125000,
            "bump_weight": 30, // in gram
            "bump_image": "https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/topics/images.jpg",
            "bump_heading": "Sub Heading <H2>",
            "bump_desc": "Description in here. As Paragraph. bla bla bla ..."
        }],
        description: "Order Bump",
        format: "array object"
    })
    bump: [{ 
        bump_name: string, 
        bump_price: number, 
        bump_weight: number, 
        bump_image: string,
        bump_heading: string,
        bump_desc: string
    }];

    // tag
    // @IsArray()
    // @ApiProperty({
    //     example: ['spotlight', 'spontant'],
    //     description: 'tags',
    //     format: 'string in array'
    // })
    tag: [string];
}

export class UpdateProductDTO extends PartialType(CreateProductDTO) { }

export class ArrayIdDTO {
    // Delete multiple ID or Clone Multiple Id
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: ['5f699e87b92fbe5320a35a93', '5f699e8bb92fbe5320a35a94'],
        description: 'Id',
        format: 'array'
    })
    id: string[];
}

export class SearchDTO {
    // Search
    @IsNotEmpty()
    @ApiProperty({
        example: "Bisnis",
        description: 'Search By Name or Description',
        format: 'string'
    })
    search: string;
}
