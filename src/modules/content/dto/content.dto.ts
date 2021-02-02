import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsObject
} from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export enum SortEnum {
    asc='asc',
    desc='desc'
}

export class CreateContentDTO {
    // Title
    @IsNotEmpty()
    @IsString()
    @ApiProperty({
        example: 'This is a sample of Title Content',
        description: 'Content',
        format: 'string'
    })
    name: string;

    // Fullfillment or Blog [type]
    @ApiProperty({
        example: false, // false to blog. true to content
        description: 'If Blog or Fullfillment',
        format: 'boolean'
    })
    isBlog: boolean;

    // Cover Images
    @ApiProperty({
        example: 'This is a Cover Image (file)',
        description: 'Cover Image',
        format: 'string'
    })
    cover_img: string;

    // Product
    //@IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            '5f4c5aee1b3800225cccec28',
            '5f4c7d496176b41b046f7bf7'
        ],
        description: 'Product',
        format: 'string'
    })
    product: [string]; // in array

    // Topic
    @IsNotEmpty()
    @IsArray()
    @ApiProperty({
        example: [
            "5f59442b7aebd32d4f1f0167",
            "5f59443c7aebd32d4f1f0168"
        ],
        description: 'Select From Field Topic',
        format: 'array'
    })
    topic: [string]; // in array

    // Title
    @ApiProperty({
        example: 'This is a Content Title',
        description: 'Title',
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
            'http://images1.jpg',
            'http://images2.jpg'
        ],
        description: 'Images',
        format: 'array'
    })
    images: [string]; // in array

    // Module // QUESTION:
    @IsArray()
    @ApiProperty({
        example: [{question: 'what is the best ?'}, {question: 'how to do it ?'}],
        description: 'question in array module',
        format: 'string in array of object'
    })
    module: [{question:string}];

    // Video Url
    @IsArray()
    @ApiProperty({
        example: [{url: 'http://video.mkv'}, {url: 'http://video2.mkv'}],
        description: 'Video Url',
        format: 'string in array of object'
    })
    video: [{url:string}];

    // Podcast Url
    @IsArray()
    @ApiProperty({
        example: [{url: 'http://podcast-indra-sacdscnkdsc.com/something'}, {url: 'http://podcast-indra-sacdscnkdsc.com/something2'}],
        description: 'Podcash Url',
        format: 'string in array of object'
    })
    podcast: [{url:string}];

    // tag
    @IsArray()
    @ApiProperty({
        example: ['spotlight', 'spontant'],
        description: 'tags',
        format: 'string in array'
    })
    tag: [string];

    author: any;
    created_at: string;
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
