import {
    IsNotEmpty,
    IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCommentDTO {
    product: string;
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