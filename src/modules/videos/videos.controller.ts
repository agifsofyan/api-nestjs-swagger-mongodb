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

import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { VideosService } from './videos.service';
import { MediaType } from '../userproducts/dto/userproducts.dto';
import { UserproductsService } from '../userproducts/userproducts.service';

var inRole = ["USER"];

@ApiTags("Videos")
@UseGuards(RolesGuard)
@Controller('userproducts/videos')
export class VideosController {
    constructor(
        private videoService: VideosService,
        private readonly userproductsService: UserproductsService
    ) {}

    /**
	 * @route    Get /api/v1/userproducts/videos
	 * @desc     Media List
	 * @access   Public
	*/
	@Get()
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Media List | Client' })

	@ApiQuery({
		name: 'index',
		description: "Available to all media or only first index",
		required: false,
		explode: true,
		type: Boolean,
		isArray: false,
        example: true
	})

    @ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'asc',
		description: 'available is: asc | desc'
	})

	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'expired_date'
	})

    @ApiQuery({
		name: 'favorite',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false,
		description: 'Favorite Content'
	})
	
	@ApiQuery({
		name: 'trending',
		required: false,
		explode: true,
		type: Boolean,
		isArray: false,
		description: 'Trending Content'
	})

	@ApiQuery({
		name: 'topic',
		required: false,
		explode: true,
		type: String,
		isArray: true,
		description: 'Topic ID content product'
	})

	async videoList(
		@Req() req,
		@Res() res,
		@Query('index') index: boolean,
	)  {
		const user = req.user
		const result = await this.userproductsService.mediaList(user, req.query, index);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `success get data`,
			total: result.length,
			data: result
		});
	}

    /**
	 * @route    Get /api/v1/userproducts/videos/product_id/:product_id
	 * @desc     Media List
	 * @access   Public
	*/
	@Get('product_id/:product_id')
	@UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Media List | Client' })

	@ApiParam({
		name: 'product_id',
		description: "Product ID",
		required: true,
		explode: true,
		type: String,
		example: '602dda671e352b12bc226dfd'
	})

	async videoSeries(
		@Param('product_id') product_id: string,
		@Res() res,
	)  {
		const result = await this.userproductsService.videoSeries(product_id);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `success get data videos`,
			total: result.length,
			data: result
		});
	}

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
