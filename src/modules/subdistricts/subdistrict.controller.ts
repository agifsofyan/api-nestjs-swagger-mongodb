import { 
    Controller,
    Get,
	HttpStatus,
    Param,
	Res,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
} from '@nestjs/swagger';

import { SubdistrictService } from './subdistrict.service';

// @ApiTags('Subdistricts')
@Controller('subdistricts')
export class SubdistrictController {
    constructor(private subdistrictService: SubdistrictService) {}

    /**
     * @route   Get api/v1/subdistricts
     * @desc    Get all subdistrict & filter
     * @access  Public
     */
    @Get(':province_code | Free')
    @ApiOperation({ summary: 'Get all subdistrict and Filter by province_code' })
    
    async listSubdistrict(@Param('province_code') province_code: string, @Res() res) {
		const result = await this.subdistrictService.list(province_code);
		
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get provinces is successful',
			data: result
		});
    }
    
    /**
	 * @route    GET /api/v1/subdistricts/id/:id
	 * @desc     Get subdistrict by id
	 * @access   Public
	 */
	@Get('id/:id')
	@ApiOperation({ summary: 'Get province by id | Free' })
	async getProvinceById(@Param('id') id: string, @Res() res)  {
		const result = await this.subdistrictService.findById(id);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get province detail is successful',
			data: result
		});
	}

	/**
	 * @route    GET /api/v1/subdistricts/code/:code
	 * @desc     Get subdistrict by id
	 * @access   Public
	 */
	@Get('province_code/:province_code')
	@ApiOperation({ summary: 'Get province by province_code | Free' })
	async getProvinceByCode(@Param('province_code') province_code: string, @Res() res)  {
		const result = await this.subdistrictService.findOne(province_code);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get Province by code is successful',
			data: result
		});
	}
}
