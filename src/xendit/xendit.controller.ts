import { Controller, Get, HttpService } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AxiosResponse } from 'axios';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { XENDIT_SECRET_KEY } from 'src/config/configuration';

@ApiTags('Xendits')
@Controller('xendits')
export class XenditController {
    constructor(private readonly httpService: HttpService) {}

    /**
     * @route   POST api/v1/xendits/payment-channels
     * @desc    Get all payment channels
     * @access  Public
     */
    @Get('payment_channels')
    @ApiOperation({ summary: 'Get all payment channels' })
    paymentChannels(): Observable<AxiosResponse<any>> {
        return this.httpService.get('https://api.xendit.co/payment_channels', {
            auth: { 
                username: XENDIT_SECRET_KEY,
                password: ''
            }
        }).pipe(
            map(res => res.data)
        );
    }

}
