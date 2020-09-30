import { Controller, Get, Query, HttpService } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RAJAONGKIR_SECRET_KEY } from '../config/configuration';

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
    cities(@Query('id') id, @Query('province') provinceId): Observable<AxiosResponse<any>> {
        let ENDPOINT = 'https://api.rajaongkir.com/starter/city';
        if (id) {
            if (provinceId) {
                ENDPOINT = `https://api.rajaongkir.com/starter/city?id=${id}&province=${provinceId}`;
            } else {
                ENDPOINT = `https://api.rajaongkir.com/starter/city?id=${id}`;
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
