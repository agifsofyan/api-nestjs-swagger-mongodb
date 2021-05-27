import {
    IsNotEmpty,
    IsObject,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum TypeComment {
    PRODUCT='product',
    CONTENT='content',
    VIDEO='video'
}

export class CreateCommentDTO {
    type: string;
    product: string;
    video: string;
    user: string;

    @ApiProperty({
        example: 'Materi ini menarik',
        description: 'Comment value',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    comment: string;

    removed: {
        author: string,
        deleted_at: Date,
    };

    created_at: Date;
    updated_at: Date;
}

export class ReplyCommentDTO {
    user: string;

    @ApiProperty({
        example: {
            id: '5f9f7118b5f54648b8ae5075',
            user: '606130ddb1ae18001c45731e'
        },
        description: 'Reaction to comment/reaction ID & User ID',
        format: 'object string'
    })
    @IsNotEmpty()
    @IsObject()
    react_to: {
        id: string,
        user: string,
    }

    @ApiProperty({
        example: 'Saya sependapat',
        description: 'Comment value',
        format: 'string'
    })
    @IsNotEmpty()
    @IsString()
    comment: string;

    removed: {
        author: string,
        deleted_at: Date,
    };

    created_at: Date;
    updated_at: Date;
}
