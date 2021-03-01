import { Controller, Get, Query, UseGuards, Res, HttpService, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { RajaongkirService } from './rajaongkir.service';
import { RajaOngkirCostDTO } from './rajaongkir.dto';

@ApiTags("Rajaongkirs")
@UseGuards(RolesGuard)
@Controller('rajaongkirs')
export class RajaongkirController {
    constructor(private readonly ongkirService: RajaongkirService, private readonly httpService: HttpService) {}

    /**
     * @route   POST api/v1/rajaongkirs/provinces
     * @desc    Get all provinces
     * @access  Public
     */
    @Get('provinces')
    @ApiOperation({ summary: 'Get all provinces | Free' })
    @ApiQuery({
		name: 'id',
		required: false,
		explode: true,
		type: Number,
        isArray: false
    })
    
    async provinces(@Res() res, @Query('id') id) {
        const result = await this.ongkirService.provinces(id)

		return res.status(result.status.code).json({
            statusCode: result.status.code,
            message: result.status.description,
            query: result.query,
            total: (result.results instanceof Array) ? result.results.length : 1,
			data: result.results
		});
    }

    /**
     * @route   POST api/v1/rajaongkirs/cities
     * @desc    Get all cities
     * @access  Public
     */
    @Get('cities')
    @ApiOperation({ summary: 'Get all cities | Free' })
    @ApiQuery({
		name: 'id',
		required: false,
		explode: true,
		type: Number,
		isArray: false
    })
    @ApiQuery({
		name: 'province',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})
    async cities(@Res() res, @Query('id') id, @Query('province') provinceId) {
        const result = await this.ongkirService.cities(id, provinceId)

		return res.status(result.status.code).json({
            statusCode: result.status.code,
            message: result.status.description,
            query: result.query,
            total: (result.results instanceof Array) ? result.results.length : 1,
			data: result.results
		});
    }

    /**
     * @route   POST api/v1/rajaongkirs/cost
     * @desc    Get Calculate Cost
     * @access  Public
     */
    @Post('cost')
    @ApiOperation({ summary: 'cost simulation | Free' })
    
    async cost(@Res() res, @Body() input: RajaOngkirCostDTO) {
        const result = await this.ongkirService.cost(input)
        const cost = result.results[0].costs.filter(cost => cost.service === 'REG')
        const serviceCost = cost[0].cost.map(c => c)

		return res.status(result.status.code).json({
            statusCode: result.status.code,
            message: result.status.description,
            query: result.query,
			data: {
                service: cost[0].service,
                description: cost[0].description,
                cost: serviceCost[0]
            }
		});
    }
}
