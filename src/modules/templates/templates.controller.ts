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
	UseGuards
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { TemplatesService } from './templates.service';
import {
    CreateTemplateDTO,
    UpdateTemplateDTO
} from './dto/templates.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN", "SALES"];

@ApiTags("Templates_B")
@UseGuards(RolesGuard)
@Controller('templates')
export class TemplatesController {
    constructor(private readonly templateService: TemplatesService) { }

	/**
	 * @route   POST /api/v1/templates
	 * @desc    Create a new templates
	 * @access  Public
	 */

	@Post()
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Create new template | Backoffice' })

	async create(@Request() req, @Res() res, @Body() input: CreateTemplateDTO) {
		const query = await this.templateService.create(req.user._id, input);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'The template has been successfully created.',
			data: query
		});
    }
    
    /**
	 * @route   Get /api/v1/templates
	 * @desc    Create a new templates
	 * @access  Public
	 */

	@Get()
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
    @ApiOperation({ summary: 'Get templates | Backoffice' })
    
    // Swagger Parameter [optional]
	@ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})

	@ApiQuery({
		name: 'offset',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})

	async findAll(@Req() req, @Res() res) {
		const query = await this.templateService.findAll(req.query);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'Get templates successfully.',
            total: query.length,
			data: query
		});
    }
    
    /**
	 * @route    Get /api/v1/templates/:name
	 * @desc     Get templates by name
	 * @access   Public
	 */

    @Get(':name')
    // @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Get template by name | Free' })

	async findById(@Param('name') name: string, @Res() res)  {
		const query = await this.templateService.findByName(name);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get template by name ${name}`,
			data: query
		});
    }
    
    /**
	 * @route   Put /api/v1/followup/:name
	 * @desc    Update follow up by name
	 * @access  Public
	 **/

	@Put(':name')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Update template by name | Backoffice' })

	async update(
		@Req() req,
		@Param('name') name: string,
		@Res() res,
		@Body() description: UpdateTemplateDTO
	) {
		const query = await this.templateService.update(req.user._id, name, description);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The template has been successfully updated.',
			data: query
		});
    }
    
    /**
	 * @route   Delete /api/v1/templates/:name
	 * @desc    Update templates by name
	 * @access  Public
	 **/

	@Delete(':name')
	// @UseGuards(JwtGuard)
	// @Roles(...inRole)
	// @ApiBearerAuth()
	@ApiOperation({ summary: 'Delete template by name | Backoffice' })

	async drop(@Res() res, @Param('name') name: string) {
		const query = await this.templateService.delete(name);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The template has been successfully deleted.',
			data: query
		});
	}
}
