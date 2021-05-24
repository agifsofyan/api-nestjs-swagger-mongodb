import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum,
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum PlacementValue {
    SPOTLIGHT='spotlight',
    STORIES='stories'
}

export enum PostTypeEnum {
    WEBINAR='webinar',
    VIDEO='video',
    TIPS='tips'
}

export class CreateBlogDTO {
    // Title
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This is a sample of Title Content',
        description: 'Content',
        format: 'string'
    })
    title: string;
    
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

    // Description
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This is a Content Description. In paragraph',
        description: 'Description',
        format: 'string'
    })
    desc: string;

    // Images
    @IsNotEmpty()
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
        description: 'Videos or Webinar',
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
    @IsNotEmpty()
    @IsString()
    @IsEnum(PlacementValue, { 
        message: 'placement value is spotlight or stories' 
    })
    placement: PlacementValue;
}

export class UpdateBlogDTO extends PartialType(CreateBlogDTO) { }
