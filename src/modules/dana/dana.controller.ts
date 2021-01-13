import {
	Controller,
	Res,
	HttpStatus,
    Body,
    Get,
	Post,
    Query,
    Req
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery
} from '@nestjs/swagger';
import { DanaService } from './dana.service';
import { DanaRequestDTO, DanaApplyTokenDTO } from './dto/dana-request.dto';

@ApiTags("Dana_B")
@Controller('dana')
export class DanaController {
    constructor(private readonly danaService: DanaService) { }

    @Post('mini')
    @ApiOperation({ summary: 'Dana Indonesia mini | Backofffice' })
    async danarequest(@Res() res, @Req() req, @Body() input: DanaRequestDTO) {
        const result = await this.danaService.danarequest(req, input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Syncron to Data',
			data: result
		});
    }

    @Post('apply-token')
    @ApiOperation({ summary: 'Dana Indonesia Apply Token | Backofffice' })
    async applyToken(@Res() res, @Body() input: DanaApplyTokenDTO) {
        const result = await this.danaService.applyToken( input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Syncron to Data',
			data: result
		});
    }

	// @Post('signature')
	// @ApiOperation({ summary: 'Dana Indonesia Signature | Backofffice' })

	// async sign(@Res() res, @Body() data: any) {
    //     const payload = data.request
    //     const signature = toSignature(payload)
    //     const verified = verify(payload, signature)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Dana Indonesia',
	// 		data: { signature: signature, verify: verified}
	// 	});
    // }
    
    // @Post('access_token')
	// @ApiOperation({ summary: 'Dana Indonesia Access Token | Backofffice' })

	// async accessToken(@Res() res, @Body() data: any) {
    //     const url = `${baseUrl}/dana/oauth/auth/applyToken.htm`
    
    //     data.signature = toSignature(data.request)

    //     console.log('data', data)
    //     try{
    //         const query = await this.http.post(url, data, headerConfig).toPromise()

    //         return res.status(HttpStatus.OK).json({
    //             statusCode: HttpStatus.OK,
    //             message: 'Dana Indonesia',
    //             data: {
    //                 signature: data.signature,
    //                 response: query.data
    //             }
    //         });
    // 	}catch(err){
	//         const e = err.response
    //         if(e.status === 404){
    //             throw new NotFoundException(e.data.message)
    //         }else if(e.status === 400){
    //             throw new BadRequestException(e.data.message)
    //         }else{
    //             throw new InternalServerErrorException
    //         }
    //     }
    // }
    
    // @Get('account')
    // @ApiOperation({ summary: 'Dana Indonesia Get Account | Backofffice' })
    // @ApiQuery({
	// 	name: 'phone',
	// 	required: false,
	// 	explode: true,
	// 	type: String,
	// 	isArray: false
    // })
    // @ApiQuery({
	// 	name: 'email',
	// 	required: false,
	// 	explode: true,
	// 	type: String,
	// 	isArray: false,
	// })
    
    // async getDanaAccount(@Res() res, @Query ('phone') phone: string, @Query ('email') email: string){
    //     const dataUser = {
    //         'mobile': phone,
    //         'verifiedTime': expiring(1),
    //         'externalUid': email,
    //         'reqTime': new Date(),
    //         'reqMsgId': phone + 'token',
    //     }

    //     const sign = toSignature(dataUser)

    //     var requestUrl = 'https://m.dana.id/m/portal/oauth?'
    //     requestUrl += 'state=' + ((Math.random() * 100000000) + 1)
    //     requestUrl += '&clientId=2020032642169039682633'
    //     requestUrl += '&scopes=DEFAULT_BASIC_PROFILE,QUERY_BALANCE,CASHIER,MINI_DANA'
    //     requestUrl += '&redirectUrl=laruno.id/callback'
    //     requestUrl += '&seamlessData=' + encodeURI(sign)
    //     // requestUrl += '&seamlessSign='. urlencode( sign )

    //     return res.status(HttpStatus.OK).json({
    //         statusCode: HttpStatus.OK,
    //         message: 'Dana Indonesia',
    //         data: requestUrl
    //     });
    // }

    // @Post('account/user')
    // @ApiOperation({ summary: 'Dana Indonesia Get Account User | Backofffice' })
    
    // async danaUser(@Res() res, @Body() data: any){
    //     const url = `${baseUrl}/dana/member/query/queryUserProfile.htm`
    
    //     data.signature = toSignature(data.request)

    //     try{
    //         const query = await this.http.post(url, data, headerConfig).toPromise()

    //         return res.status(HttpStatus.OK).json({
    //             statusCode: HttpStatus.OK,
    //             message: 'Dana Indonesia',
    //             data: {
    //                 signature: data.signature,
    //                 response: query.data
    //             }
    //         });
    // 	}catch(err){
	//         const e = err.response
    //         if(e.status === 404){
    //             throw new NotFoundException(e.data.message)
    //         }else if(e.status === 400){
    //             throw new BadRequestException(e.data.message)
    //         }else{
    //             throw new InternalServerErrorException
    //         }
    //     }
    // }
}
