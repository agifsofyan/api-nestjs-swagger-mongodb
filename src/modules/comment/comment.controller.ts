import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Req,
	Param,
	Body,
	Post,
	Put,
	Delete,
	UseGuards,
	Query
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery,
	ApiParam
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { CommentService } from './comment.service';
import { CreateCommentDTO, ReplyCommentDTO } from './dto/comment.dto';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';

@ApiTags("Comments")
@UseGuards(RolesGuard)

@Controller('comments')
export class CommentController {
    constructor(private readonly commentService: CommentService) { }

    /**
	 * @route   POST /api/v1/comments/product/:product_id
	 * @desc    Create a new comment
	 * @access  Public
	 */

	@Post('product/:product_id')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new comment | Client' })

    @ApiParam({
		name: 'product_id',
		required: true,
		explode: true,
		type: String,
		example: '606a1e52bba625235d758efa',
		description: 'Product ID'
	})

    async newComment(
        @Param('product_id') product_id: string,
        @Body() input: CreateCommentDTO,
        @Res() res: any,
        @User() user: IUser
    ) {
        const result = await this.commentService.newComment(product_id, input, user)

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Comment Success.',
			data: result
		});
    }

    /**
	 * @route   POST /api/v1/comments/:comment_id/like
	 * @desc    Like this comment
	 * @access  Public
	 */

	@Post(':comment_id/like')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Like this comment | Client' })

    @ApiParam({
		name: 'comment_id',
		required: true,
		explode: true,
		type: String,
		example: '606a39bbd53ba3135df7390c',
		description: 'Comment ID'
	})

    async likeComment(
        @Param('comment_id') comment_id: string,
        @Res() res: any,
        @User() user: IUser
    ) {
        const result = await this.commentService.likeComment(comment_id, user)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result.msg,
			data: result.comment
		});
    }

    /**
	 * @route   POST /api/v1/comments/:comment_parent_id/reply
	 * @desc    Reply this comment
	 * @access  Public
	 */

	@Post(':comment_id/reply')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Reply this comment | Client' })

    @ApiParam({
		name: 'comment_id',
		required: true,
		explode: true,
		type: String,
		example: '606c2bb0e7badfe228221eae',
		description: 'Comment ID'
	})

    async replyComment(
        @Param('comment_id') comment_id: string,
        @Body() input: ReplyCommentDTO,
        @Res() res: any,
        @User() user: IUser
    ) {
        const result = await this.commentService.replyComment(comment_id, input, user)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Reply this Comment Successful.',
			data: result
		});
    }
}
