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
	ApiQuery,
	ApiParam
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { TemplatesService } from './templates.service';
import {
	TemplateType,
    CreateTemplateDTO,
	newVersionDTO,
    UpdateTemplateDTO,
	updateVersionDTO
} from './dto/templates.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN", "SALES"];

@ApiTags("Templates")
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
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new template | Backoffice' })

	async create(@Request() req, @Res() res, @Body() input: CreateTemplateDTO) {
		input.by = req.user._id
		const query = await this.templateService.create(input);

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
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get templates | Backoffice' })
    
    // Swagger Parameter [optional]
	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'MAIL'
	})

	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false,
		example: 'type'
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

    @Get('/:name')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get template by name | Backoffice' })

	@ApiParam({
		name: 'name',
		required: true,
		explode: true,
		type: String,
		example: 'laruno_blast',
		description: 'Template Name'
	})

	async findByName(@Param('name') name: string, @Res() res)  {
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
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update template by name | Backoffice' })

	@ApiParam({
		name: 'name',
		required: true,
		explode: false,
		type: String,
		example: 'laruno_blast',
		description: 'Template Name'
	})

	async update(
		@Req() req,
		@Param('name') name: string,
		@Res() res,
		@Body() input: UpdateTemplateDTO
	) {
		input.by = req.user._id
		const query = await this.templateService.update(name, input);
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
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete template by name | Backoffice' })

	@ApiParam({
		name: 'name',
		required: true,
		explode: false,
		type: String,
		example: 'laruno_blast',
		description: 'Template Name'
	})

	async drop(@Res() res, @Param('name') name: string) {
		const query = await this.templateService.delete(name);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'The template has been successfully deleted.',
			data: query
		});
	}

	@Get('/:template_name/versions')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get email templates version - Mailgun | Backofffice' })

	@ApiParam({
		name: 'template_name',
		required: true,
		explode: false,
		type: String,
		example: 'laruno_blast',
		description: 'Template Name'
	})

	async getTemplatesVersion(@Res() res, @Param('template_name') template_name: string) {
		const result = await this.templateService.getTemplatesVersion(template_name)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get template version`,
			data: result
		});
	}

	/**
	 * @route   Post /api/v1/mails/mailgun/templates/:template_name/versions
	 * @desc    Create Email Template Version - Mailgun
	 * @access  Public
	 */

	@Post('/:template_name/versions')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Create new version of email templates - Mailgun | Backofffice' })

	@ApiParam({
		name: 'template_name',
		required: true,
		explode: false,
		type: String,
		example: 'laruno_blast',
		description: 'Template Name'
	})

	async newTemplatesVersion(
		@Res() res,
		@Body() input: newVersionDTO, 
		@Param('template_name') template_name: string
	) {
		const result = await this.templateService.newTemplatesVersion(template_name, input)

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: `Success create new template version`,
			data: result
		})
	}

	/**
	 * @route   Put /api/v1/templates/:template_name/versions/version_tag
	 * @desc    Update Email Template Version - Mailgun
	 * @access  Public
	 */

	@Put('/:template_name/versions/:version_tag')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update version of email templates - Mailgun | Backofffice' })

	@ApiParam({
		name: 'template_name',
		required: true,
		explode: false,
		type: String,
		example: 'laruno_blast',
		description: 'Template Name'
	})

	@ApiParam({
		name: 'version_tag',
		required: true,
		explode: false,
		type: String,
		example: 'initial',
		description: 'Template Version'
	})

	async updateTemplatesVersion(
		@Res() res,
		@Body() input: updateVersionDTO, 
		@Param('template_name') template_name: string,
		@Param('version_tag') version_tag: string,
	) {
		const result = await this.templateService.updateTemplatesVersion(template_name, version_tag, input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success update template version`,
			data: result
		});
	}

	/**
	 * @route   Delete /api/v1/templates/:template_name/versions/version_tag
	 * @desc    Remove Email Template Version - Mailgun
	 * @access  Public
	 */

	@Delete('/:template_name/versions/:version_tag')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete version of email templates - Mailgun | Backofffice' })

	@ApiParam({
		name: 'template_name',
		required: true,
		explode: false,
		type: String,
		example: 'laruno_blast',
		description: 'Template Name'
	})

	@ApiParam({
		name: 'version_tag',
		required: true,
		explode: false,
		type: String,
		example: 'initial',
		description: 'Template Version'
	})

	async dropTemplatesVersion(
		@Res() res,
		@Param('template_name') template_name: string,
		@Param('version_tag') version_tag: string,
	) {
		const result = await this.templateService.dropTemplatesVersion(template_name, version_tag)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success remove template version`,
			data: result
		});
	}
}