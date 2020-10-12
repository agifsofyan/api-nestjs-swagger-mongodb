import { 
    Controller,
    Get,
    Param,
    Post,
    Req
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery
} from '@nestjs/swagger';

import { ProvinceService } from './province.service';

@ApiTags('Provinces')
@Controller('provinces')
export class ProvinceController {
    constructor(private provinceService: ProvinceService) {}

    /**
     * @route   Get api/v1/provinces
     * @desc    Get all province & filter
     * @access  Public
     */
    @Get()
    @ApiOperation({ summary: 'Get all province and Filter' })
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
    async listProvince(@Req() req) {
        return await this.provinceService.list(req.query);
	}

    /**
	 * @route    GET /api/v1/provinces/id/:id
	 * @desc     Get province by id
	 * @access   Public
	 */
	@Get('id/:id')
	@ApiOperation({ summary: 'Get province by id' })
	async getProvinceById(@Param('id') id: string)  {
		return await this.provinceService.findById(id);
	}

	/**
	 * @route    GET /api/v1/provinces/code/:code
	 * @desc     Get province by id
	 * @access   Public
	 */
	@Get('code/:code')
	@ApiOperation({ summary: 'Get province by code' })
	async getProvinceByCode(@Param('code') code: string)  {
		return await this.provinceService.findOne(code);
	}
}
