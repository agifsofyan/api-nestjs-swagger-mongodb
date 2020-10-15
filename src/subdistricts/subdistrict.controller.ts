import { 
    Controller,
    Get,
    Param,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
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
    @Get(':province_code')
    @ApiOperation({ summary: 'Get all subdistrict and Filter by province_code' })
    
    async listSubdistrict(@Param('province_code') province_code: string) {
        return await this.subdistrictService.list(province_code);
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
	@Get('province_code/:province_code')
	@ApiOperation({ summary: 'Get province by province_code' })
	async getProvinceByCode(@Param('province_code') province_code: string)  {
		return await this.subdistrictService.findOne(province_code);
	}
}
