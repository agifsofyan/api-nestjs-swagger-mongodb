import { 
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Res,
    Req,
    HttpStatus,
    Query,
    Ip,
    Param
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiQuery,
    ApiParam
} from '@nestjs/swagger';

import { VideosDTO } from './dto/videos.dto';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VideosService } from './videos.service';

var inRole = ["USER"];

@ApiTags("Videos")
@UseGuards(RolesGuard)
@Controller('videos')
export class VideosController {
    constructor(private videoService: VideosService) {}

    /**
	 * @route   POST api/v1/videos/:video_id/like
	 * @desc    Like the video
	 * @access  Public
	*/

    @Post(':video_id/like')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Like The Video | Client' })
 
    @ApiParam({
        name: 'video_id',
        required: true,
        explode: true,
        type: String,
        example: '603355b37d078958405f85a1'
    })
 
    async addLike(
        @Param('video_id') video_id: string,
        @User() user: IUser,
        @Ip() ip: string,
        @Res() res
    ) {
        const userID = user._id
        const result = await this.videoService.add(video_id, userID, ip, 'likes')
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'Successfully liked the video',
            data: result
        });
    }

    /**
	 * @route   POST api/v1/videos/:video_id/view
	 * @desc    View the video
	 * @access  Public
	*/

    @Post(':video_id/view')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'View The Video | Client' })
 
    @ApiParam({
        name: 'video_id',
        required: true,
        explode: true,
        type: String,
        example: '603355b37d078958405f85a1'
    })
 
    async addView(
        @Param('video_id') video_id: string,
        @User() user: IUser,
        @Ip() ip: string,
        @Res() res
    ) {
        const userID = user._id
        const result = await this.videoService.add(video_id, userID, ip, 'viewer')
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'Successfully View the video',
            data: result
        });
    }

    /**
	 * @route   POST api/v1/videos/:video_id/share
	 * @desc    Share the video
	 * @access  Public
	*/

    @Post(':video_id/share')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Share The Video | Client' })
 
    @ApiParam({
        name: 'video_id',
        required: true,
        explode: true,
        type: String,
        example: '603355b37d078958405f85a1'
    })

    @ApiQuery({
        name: 'share_to',
        required: true,
        explode: true,
        type: String,
        example: 'facebook'
    })
 
    async addShare(
        @Param('video_id') video_id: string,
        @Param('share_to') share_to: string,
        @User() user: IUser,
        @Ip() ip: string,
        @Res() res
    ) {
        const userID = user._id
        const result = await this.videoService.add(video_id, userID, ip, 'shared', share_to)
        return res.status(HttpStatus.OK).json({
            statusCode: HttpStatus.OK,
            message: 'Successfully Share the video',
            data: result
        });
    }
}
