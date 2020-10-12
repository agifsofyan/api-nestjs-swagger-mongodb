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

import { SubdistrictService } from './subdistrict.service';

@ApiTags('Subdistricts')
@Controller('subdistricts')
export class SubdistrictController {
    constructor(private subdistrictService: SubdistrictService) {}

    /**
     * @route   Get api/v1/subdistricts
     * @desc    Get all subdistrict & filter
     * @access  Public
     */
    @Get(':code')
    @ApiOperation({ summary: 'Get all subdistrict and Filter' })
    
    async listSubdistrict(@Param('code') code: string) {
        return await this.subdistrictService.list(code);
    }
    
    /**
	 * @route    GET /api/v1/subdistricts/id/:id
	 * @desc     Get subdistrict by id
	 * @access   Public
	 */
	@Get('id/:id')
	@ApiOperation({ summary: 'Get province by id' })
	async getProvinceById(@Param('id') id: string)  {
		return await this.subdistrictService.findById(id);
	}

	/**
	 * @route    GET /api/v1/subdistricts/code/:code
	 * @desc     Get subdistrict by id
	 * @access   Public
	 */
	@Get('province_code/:code')
	@ApiOperation({ summary: 'Get province by code' })
	async getProvinceByCode(@Param('code') code: string)  {
		return await this.subdistrictService.findOne(code);
	}
}
