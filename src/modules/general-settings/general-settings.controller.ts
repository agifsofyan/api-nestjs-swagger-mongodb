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

import { GeneralSettingsService } from './general-settings.service';
import { GeneralSetingDto } from './dto/general-setings.dto';
import { SetGeneralDto } from './dto/set-general.dto';
import { SetPrivacyPoliceDto, SetTermConditionDto, SetFaqDto } from './dto/set-general-settings.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("General-settings")
@UseGuards(RolesGuard)
@Controller('general-settings')
export class GeneralSettingsController {
    constructor(private readonly generalService: GeneralSettingsService) { }

    /**
	* @route   POST /api/v1/general-setting
	* @desc    Create a new General Setting
	* @access  Public
	*/

	@Post()
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set General Setting | Backoffice' })

	async setGeneral(@Res() res, @Body() GeneralSeting: SetGeneralDto) {
		const result = await this.generalService.setGeneral(GeneralSeting);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set generat setting',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting
	* @desc    Get General Setting
	* @access  Public
	*/

	@Get()
	@UseGuards(JwtGuard)
	@Roles(...inRole, "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get General Setting | Backoffice, Client' })

	async getGeneral(@Res() res)  {
		const result = await this.generalService.getGeneral();

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get general setting',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting/privacy-police
	* @desc    Get General Setting - Privacy Police
	* @access  Public
	*/

	@Get('privacy-police')
	@UseGuards(JwtGuard)
	@Roles(...inRole, "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get Privacy Police | Backoffice, Client' })

	async getPrivacyPolice(@Res() res)  {
		const result = await this.generalService.getPrivacyPolice();

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get privacy police',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting/term-condition
	* @desc    Get General Setting - Term & Condition
	* @access  Public
	*/

	@Get('term-condition')
	@UseGuards(JwtGuard)
	@Roles(...inRole, "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get Term & Condition | Backoffice, Client' })

	async getTermCondition(@Res() res)  {
		const result = await this.generalService.getTermCondition();

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get term & condition',
			data: result
		});
	}

	/**
	* @route   GET /api/v1/general-setting/faq
	* @desc    Get General Setting - FAQ
	* @access  Public
	*/

	@Get('faq')
	@UseGuards(JwtGuard)
	@Roles(...inRole, "USER")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get FAQ | Backoffice, Client' })

	async getFaq(@Res() res)  {
		const result = await this.generalService.getFaq();

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'success get faq',
			data: result
		});
	}

	// Set
	/**
	* @route   POST /api/v1/general-setting/privacy-police
	* @desc    Set General Setting - Privacy Police
	* @access  Public
	*/

	@Post('privacy-police')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Privacy Police | Backoffice' })

	async setPrivacyPolice(@Res() res, @Body() privacyPolice: SetPrivacyPoliceDto)  {
		const result = await this.generalService.setPrivacyPolice(privacyPolice);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set privacy police',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/term-condition
	* @desc    Set General Setting - Term & Condition
	* @access  Public
	*/

	@Post('term-condition')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set Term & Condition | Backoffice' })

	async setTermCondition(@Res() res, @Body() termCondition: SetTermConditionDto)  {
		const result = await this.generalService.setTermCondition(termCondition);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set term & condition',
			data: result
		});
	}

	/**
	* @route   POST /api/v1/general-setting/faq
	* @desc    Set General Setting - FAQ
	* @access  Public
	*/

	@Post('faq')
	@UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Set FAQ | Backoffice' })

	async setFaq(@Res() res, @Body() setFaq: SetFaqDto)  {
		const result = await this.generalService.setFaq(setFaq);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'success set faq',
			data: result
		});
	}
}
