import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Req,
	Request,
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

import { FollowupService } from './followup.service';
import { CreateFollowUpDTO, templateFollow, SetTemplateFollowUpDTO } from './dto/followup.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN", "SALES", "CONTENT"];

@ApiTags("FollowUps")
@UseGuards(RolesGuard)
@Controller('followups')
export class FollowupController {
    constructor(private readonly followService: FollowupService) { }

	/**
	 * @route   POST /api/v1/followups/:order_id
	 * @desc    Create a new followups
	 * @access  Public
	 */

	@Post(':order_id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Sending follow up message | Backoffice' })

	@ApiParam({
		name: 'order_id',
		required: true,
		explode: true,
		type: String,
		example: '6074fb4acc151715cce22764',
		description: 'Order ID'
	})

	async create(
		@Request() req, 
		@Res() res, 
		@Param('order_id') order_id: string,
		@Body() input: CreateFollowUpDTO
	) {
		const agentID = req.user._id
		const query = await this.followService.sendWA(agentID, order_id, input);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Successfully sending message',
			data: query
		});
	}

	/**
	 * @route   GET /api/v1/followups/
	 * @desc    Get followups
	 * @access  Public
	 */

	@Get(':order_id')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get follow up | Backoffice' })

	@ApiParam({
		name: 'order_id',
		required: true,
		explode: true,
		type: String,
		example: '60336f0b889fd02414465828',
		description: 'Order ID'
	})
 
	async get(@Res() res, @Param('order_id') order_id: string) {
		const query = await this.followService.getFollowUp(order_id);
 
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Successfully sending message',
			data: query
		});
	}

	/**
	 * @route   PUT /api/v1/followups/set-template?title=followup1
	 * @desc    Set followup template
	 * @access  Public
	 */

	 @Put('set-template')
	 @UseGuards(JwtGuard)
	 @Roles(...inRole)
	 @ApiBearerAuth()
	 @ApiOperation({ summary: 'Sending follow up message | Backoffice' })

	 @ApiQuery({
		name: 'title',
		required: true,
		explode: true,
		type: String,
		isArray: false,
		enum: templateFollow
    })
 
	 async setTemplate(
		 @Request() req, 
		 @Res() res, 
		 @Query('title') title: string,
		 @Body() input: SetTemplateFollowUpDTO,
	 ) {
		 const agentID = req.user._id
		 const query = await this.followService.setFollowUpTemplate(title, input, agentID);
 
		 return res.status(HttpStatus.OK).json({
			 statusCode: HttpStatus.OK,
			 message: 'Successfully set template',
			 data: query
		 });
	 }
}
