import { Controller, Get, Query, HttpService, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RAJAONGKIR_SECRET_KEY } from '../config/configuration';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Controller('rajaongkirs')
export class RajaongkirController {
    constructor(private readonly httpService: HttpService) {}

    /**
     * @route   POST api/v1/rajaongkirs/provinces
     * @desc    Get all provinces
     * @access  Public
     */
    @Get('provinces')
    @ApiOperation({ summary: 'Get all provinces' })
    @ApiQuery({
		name: 'id',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})
    provinces(@Query('id') id): Observable<AxiosResponse<any>> {
        let ENDPOINT = 'https://api.rajaongkir.com/starter/province';
        if (id) {
            ENDPOINT = `https://api.rajaongkir.com/starter/province?id=${id}`;
        }
        return this.httpService.get(ENDPOINT, {
            headers: { 
                key: RAJAONGKIR_SECRET_KEY
            }
        }).pipe(
            map(res => res.data)
        );
    }

    /**
     * @route   POST api/v1/rajaongkirs/cities
     * @desc    Get all cities
     * @access  Public
     */
    @Get('cities')
    @ApiOperation({ summary: 'Get all cities' })
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
    cities(@Query('id') id, @Query('province') provinceId): Observable<AxiosResponse<any>> {
        let ENDPOINT = 'https://api.rajaongkir.com/starter/city';
        if (id) {
            if (provinceId) {
                ENDPOINT = `https://api.rajaongkir.com/starter/city?id=${id}&province=${provinceId}`;
            } else {
                ENDPOINT = `https://api.rajaongkir.com/starter/city?id=${id}`;
            }
        } else {
            if (provinceId) {
                ENDPOINT = `https://api.rajaongkir.com/starter/city?province=${provinceId}`
            }
        }
        return this.httpService.get(ENDPOINT, {
            headers: { 
                key: RAJAONGKIR_SECRET_KEY
            }
        }).pipe(
            map(res => res.data)
        );
    }
}
