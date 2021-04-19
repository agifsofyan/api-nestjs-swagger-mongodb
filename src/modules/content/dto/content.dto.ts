import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum,
    IsObject
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum SortEnum {
    asc='asc',
    desc='desc'
}

export enum PlacementValue {
    SPOTLIGHT='spotlight',
    STORIES='stories'
}

export enum PostTypeEnum {
    WEBINAR='webinar',
    VIDEO='video',
    TIPS='tips'
}

export class CreateContentDTO {
    // Fullfillment or Blog [type]
    @ApiProperty({
        example: false, // false to blog. true to content
        description: 'If Blog or Fullfillment',
        format: 'boolean'
    })
    isBlog: boolean;

    // Product
    //@IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: '602dd99fb3d86020f078e0a0',
        description: 'Product ID',
        format: 'string'
    })
    product: string;
    
    // Topic
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            "5fb639cdf5cdfe00749e0b0f",
            "5fb636b3f5cdfe00749e0b05"
        ],
        description: 'Select From Field Topic',
        format: 'array'
    })
    topic: [string];

    // Title
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This is a sample of Title Content',
        description: 'Content',
        format: 'string'
    })
    title: string;

    // Description
    @ApiProperty({
        example: 'This is a Content Description. In paragraph',
        description: 'Description',
        format: 'string'
    })
    desc: string;

    // Images
    @IsArray()
    @ApiProperty({
        example: [
            'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/freelance-business-women-casual-wear-using-tablet-working-call-video-conference-with-customer-workplace-living-room-home-happy-young-asian-girl-relax-sitting-desk-job-internet.jpg',
            'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/4.jpg'
        ],
        description: 'Images',
        format: 'array'
    })
    images: [string]; // in array

    // Module // QUESTION:
    @ApiProperty({
        example: {
            statement: [
                { value: 'statement / action 1' },
                { value: 'statement / action 2' },
                { value: 'statement / action 3' },
            ], 
            question: [
                { value: 'question 1 ?' },
                { value: 'question 2 ?' }
            ],
            mission: [
                { value: 'mission / checklist / task  1' },
                { value: 'mission / checklist / task  2' },
                { value: 'mission / checklist / task  3' },
                { value: 'mission / checklist / task  4' },
            ],
            mind_map: [
                { value: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/4.jpg' },
                { value: 'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/tumblr_622ae3f8dd5f88dd0a0cce5e36a20d2d_8114b6e4_500.jpg' },
            ]
        },
        description: 'Module. Module not inserted when content type is blog',
        format: 'array of object in object'
    })
    module: { 
        statement: [{ value: string }],
        question: [{ value: string }],
        mission: [{ value: string }],
        mind_map: [{ value: string }]
    };

    // Podcast Url
    @IsArray()
    @ApiProperty({
        example: [
            {
                url: 'https://file-examples-com.github.io/uploads/2017/11/file_example_OOG_1MG.ogg',
                title: 'Podcast part 1',
            }, 
            {
                url: 'https://file-examples-com.github.io/uploads/2017/11/file_example_MP3_700KB.mp3',
                title: 'Podcast part 2',
            },
            {
                url: 'https://file-examples-com.github.io/uploads/2017/11/file_example_WAV_1MG.wav',
                title: 'Podcast part 2',
            }
        ],
        description: 'Podcash Url',
        format: 'string in array of object'
    })
    podcast: [{
        url:string,
        title:string,
    }];

    // Video Url
    @IsArray()
    @ApiProperty({
        example: [{
            url: 'https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/videos/samplevideo_1280x720_5mb.mp4',
            title: 'Video part 1'
        }, {
            url: 'https://laruno2020.s3.ap-southeast-1.amazonaws.com/ASSETS/products/videoplayback-%281%29.mp4',
            title: 'Video part 2'
        }],
        description: 'Videos',
        format: 'string in array of object'
    })
    video: [{
        url: string, 
        title: string
    }];

    //tag: [string]; // tag name
    author: string;

    // Placement
    @ApiProperty({
        example: 'spotlight',
        description: 'Placement',
        format: 'enum string',
        enum: PlacementValue
    })
    @IsString()
    @IsEnum(PlacementValue, { 
        message: 'placement value is spotlight or stories' 
    })
    placement: PlacementValue;

    // Thanks
    @ApiProperty({
        example: {
            video: "https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/tdw2.jpg",
            title: "Thankyou Title",
            description: "Thankyou description"
        },
        description: 'Content',
        format: 'string'
    })
    thanks: {
        video: string,
        title: string,
        description: string
    };

    //Mentor
    mentor: string;

    // Post Type
    @ApiProperty({
        example: 'Kelas Karyawan',
        description: 'Content',
        format: 'string',
        enum: PostTypeEnum,
        enumName: 'PostTypeEnum'
    })
    @IsString()
    @IsEnum(PostTypeEnum, { 
        message: 'post type value is: webinar | video | tips'
    })
    post_type: PostTypeEnum;

    // Series
    series: boolean;
}

// export type UpdateContentDTO = Partial<CreateContentDTO>;
export class UpdateContentDTO extends PartialType(CreateContentDTO) { }

export class ArrayIdDTO {
    // Delete multiple ID
    @IsNotEmpty()
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
        example: "Something",
        description: 'Search By Name or Content',
        format: 'string'
    })
    search: string;
}