import {
    IsNotEmpty,
    IsString,
    IsArray,
    IsEnum
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
    @IsString()
    @ApiProperty({
        example: '5f4c5aee1b3800225cccec28',
        description: 'Product',
        format: 'string'
    })
    product: string;
    
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
        example: [{
            statement_list: 'is the best', 
            question_list: 'how to do it ?',
            mission_list: 'go to mid line',
            mind_map: 'upload image here'
        }],
        description: 'module',
        format: 'array of object'
    })
    module: [{ 
        statement_list: string,
        question_list: string,
        mission_list: string,
        mind_map: [string]
    }];

    // Podcast Url
    @IsArray()
    @ApiProperty({
        example: [{url: 'http://podcast-indra-sacdscnkdsc.com/something'}, {url: 'http://podcast-indra-sacdscnkdsc.com/something2'}],
        description: 'Podcash Url',
        format: 'string in array of object'
    })
    podcast: [{url:string}];

    // Video Url
    @IsArray()
    @ApiProperty({
        example: [{url: 'http://video.mkv'}, {url: 'http://video2.mkv'}],
        description: 'Video Url',
        format: 'string in array of object'
    })
    video: [{url:string}];

    tag: [string];
    author: any;
    created_at: string;

    // Placement
    @ApiProperty({
        //example: 'This is a sample of Title Content',
        description: 'Content',
        format: 'enum string',
        enum: PlacementValue
    })
    @IsEnum(PlacementValue, { 
        message: 'placement value is spotlight or stories' 
    })
    placement: PlacementValue;

    // Series
    @ApiProperty({
        example: 'Kelas Karyawan',
        description: 'Content',
        format: 'string'
    })
    series: string;
}

// export type UpdateContentDTO = Partial<CreateContentDTO>;
export class UpdateContentDTO extends PartialType(CreateContentDTO) { }

export class AnswerModule {
    // Answer
    @ApiProperty({
        example: "i'm Grooth",
        description: 'Module Answer',
        format: 'string'
    })
    answer: string;

    answer_date: string;

    // Mission Done
    @ApiProperty({
        example: true,
        description: 'Mission Complete',
        format: 'boolean'
    })
    mission_complete: boolean;
}

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
