import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsObject
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

export class CreateFulfillmentDTO {
    isBlog: boolean;

    // Product
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: '602dda671e352b12bc226dfd',
        description: 'Product ID',
        format: 'string'
    })
    product: string;

    // Thanks
    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: {
            video: "https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/contents/y2mate.com-mac-os-x-welcome-videos_360p.mp4",
            title: "Thankyou Video",
            description: "Thankyou video description"
        },
        description: 'Content',
        format: 'string'
    })
    thanks: {
        video: string,
        title: string,
        description: string
    };

    // Goal Of Product
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'Goal Of Product bla... bla... bla...',
        description: 'Description',
        format: 'string'
    })
    goal: string;

    // Add Module
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

    // Add Post
    @IsNotEmpty()
    @IsObject()
    @ApiProperty({
        example: {
            title: 'fulfillment post title',
            topic: ["5fb639cdf5cdfe00749e0b0f", "5fb636b3f5cdfe00749e0b05"],
            images: [
                'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/freelance-business-women-casual-wear-using-tablet-working-call-video-conference-with-customer-workplace-living-room-home-happy-young-asian-girl-relax-sitting-desk-job-internet.jpg',
                'https://s3.ap-southeast-1.amazonaws.com/cdn.laruno.com/connect/products/4.jpg'
            ],
            placement: 'spotlight',
            post_type: 'webinar'
        },
        description: 'Add Post Fulfillment Content',
        format: 'Object'
    })
    post: {
        title: string,
        topic: [string],
        images: [string],
        placement: string,
        post_type: string
    }

    // Webinar
    @IsArray()
    @ApiProperty({
        example: [{
            platform: 'zoom',
            url: 'https://us04web.zoom.us/j/74239116251?pwd=UzB0dy9WVlB4MEdXOTNRTDV4RVNmdz09',
            title: 'Video part 1',
            start_datetime: '2021-02-22T06:56:51.369Z',
            duration: 60 // in minute
        },{
            platform: 'youtube',
            url: 'https://www.youtube.com/watch?v=7DxpOG7w2Kc',
            title: 'Video part 2',
            start_datetime: '2021-02-22T09:56:51.369Z',
            duration: 120 // in minute
        },{
            platform: 'google-meet',
            url: 'https://meet.google.com/hcw-fbfc-qbj',
            title: 'Video part 2',
            start_datetime: '2021-02-22T09:56:51.369Z',
            duration: 120 // in minute
        }],
        description: 'Videos or Webinar',
        format: 'string in array of object'
    })
    webinar: [{
        platform: string, // zoom, google-meet, youtube
        url: string, 
        title: string,
        start_datetime: string,
        duration: number
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
        format: 'array of object'
    })
    video: [{
        url: string, 
        title: string
    }];

    // Podcast Url
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
        format: 'array of object'
    })
    podcast: [{
        url:string,
        title:string,
    }];

    // Tips
    @ApiProperty({
        example: 'Tips Description bla... bla... bla...',
        description: 'Description Tips',
        format: 'string'
    })
    tips: string;

    author: string;
}