import { 
    Controller,
    Get,
	HttpStatus,
    Param,
    Req,
	Res
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';

import { ProvinceService } from './province.service';

// @ApiTags('Provinces')
@Controller('provinces')
export class ProvinceController {
    constructor(private provinceService: ProvinceService) {}

    /**
     * @route   GET api/v1/provinces
     * @desc    Get all province & filter
     * @access  Public
     */
    @Get()
    @ApiOperation({ summary: 'Get all province and Filter | Free' })
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
    async listProvince(@Req() req, @Res() res) {
		const result = await this.provinceService.list(req.query);
		
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get provinces is successful',
			total: result.length,
			data: result
		});
	}

    /**
	 * @route    GET /api/v1/provinces/id/:id
	 * @desc     Get province by id
	 * @access   Public
	 */
	@Get('id/:id')
	@ApiOperation({ summary: 'Get province by id | Free' })
	async getProvinceById(@Param('id') id: string, @Res() res)  {
		const result = await this.provinceService.findById(id);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get Province id is successful',
			data: result
		});
	}

	/**
	 * @route    GET /api/v1/provinces/code/:code
	 * @desc     Get province by id
	 * @access   Public
	 */
	@Get('code/:code')
	@ApiOperation({ summary: 'Get province by code | Free' })
	async getProvinceByCode(@Param('code') code: string, @Res() res)  {
		const result = await this.provinceService.findOne(code);

		return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'get provience by code is successful',
			data: result
		});
	}
}
