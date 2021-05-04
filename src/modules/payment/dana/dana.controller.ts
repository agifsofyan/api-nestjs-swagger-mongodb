import {
	Controller,
	Res,
	HttpStatus,
    Body,
    Get,
	Post,
    Query,
    Req,
    UseGuards,
    Param
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery,
    ApiParam
} from '@nestjs/swagger';
import { Roles } from 'src/modules/auth/decorators/roles.decorator';
import { JwtGuard } from 'src/modules/auth/guards/jwt.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { DanaService } from './dana.service';
import { DanaOrderNotifyDTO } from './dto/dana-order-notify.dto';
import { DanaOrderDTO, OrderNotifyDTO } from './dto/dana-order.dto';
import { DanaRequestDTO, DanaApplyTokenDTO } from './dto/dana-request.dto';

@ApiTags("Dana_Indonesia")
@UseGuards(RolesGuard)
@Controller('dana')
export class DanaController {
    constructor(private readonly danaService: DanaService) { }

    @Post('oauth')
    @UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
    @ApiOperation({ summary: 'OAuth to Dana Indonesia | Client' })
    async danarequest(@Res() res, @Req() req, @Body() input: DanaRequestDTO) {
        const result = await this.danaService.danarequest(req, input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Syncron to Data',
			data: result
		});
    }

    @Post('apply-token/:auth_code')
    @UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Dana Indonesia Apply Token | Client' })

    @ApiParam({
		name: 'auth_code',
		required: true,
		type: String,
		example: '5Ml3Xx6FFpF8AbAgpJQXXdTiPBMnbyzx2w3H4100',
		description: 'Module Type'
	})

    async applyToken(@Req() req, @Param('auth_code') auth_code:string, @Res() res) {
        const userID = req.user._id
        const result = await this.danaService.applyToken(userID, auth_code)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Apply the Token to Syncron Data',
			data: result
		});
    }

    @Get('user-dana/:access_token')
    @ApiOperation({ summary: 'Dana Indonesia User Dana | Backofffice' })

    @ApiParam({
		name: 'access_token',
		required: true,
		type: String,
		example: 'Kf0CaQ1gTZIm40965Wof8alZ7283LCDDnq9A4100',
		description: 'Access Token from DANA'
	})

    async userDana(@Param('access_token') access_token:string, @Res() res) {
        const result = await this.danaService.userDana(access_token)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Syncron to Data',
			data: result
		});
    }

    @Post('order')
    @UseGuards(JwtGuard)
	@Roles("USER")
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Dana Indonesia Create Order | Client' })
    async order(@Res() res, @Body() input: DanaOrderDTO) {
        const result = await this.danaService.order(input)

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Syncron to Data',
			data: result
		});
    }

    // @Post('capture')
    // @ApiOperation({ summary: 'Dana Indonesia Capture | Backofffice' })
    // async capture(@Res() res, @Body() input: DanaOrderDTO) {
    //     const result = await this.danaService.capture(input)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Syncron to Data',
	// 		data: result
	// 	});
    // }

    // @Post('acquiring-seamless')
    // @ApiOperation({ summary: 'Dana Indonesia Acquiring Seamless | Backofffice' })
    // async acquiringSeamless(@Res() res, @Body() input: DanaOrderDTO) {
    //     const result = await this.danaService.acquiringSeamless(input)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Syncron to Data',
	// 		data: result
	// 	});
    // }

    // @Post('finishNotify')
    // @ApiOperation({ summary: 'Dana Callback | Backofffice' })
    // async finishNotify(@Res() res, @Body() input: OrderNotifyDTO) {
    //     const result = await this.danaService.finishNotify(input)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Syncron to Data',
	// 		data: result
	// 	});
    // }

    // @Post('finishNotify-check')
    // @ApiOperation({ summary: 'Dana Callback | Backofffice' })
    // async finishNotifyCheck(@Res() res, @Body() input: DanaOrderNotifyDTO) {
    //     const result = await this.danaService.finishNotifyCheck(input)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Syncron to Data',
	// 		data: result
	// 	});
    // }
    
    // @Post('order/finish')
    // @ApiOperation({ summary: 'Dana Order Finish | Backofffice' })
    // async orderFinish(@Res() res, @Req() req) {
    //     const result = await this.danaService.orderFinish(req)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Syncron to Data',
	// 		data: result
	// 	});
    // }

    // @Post('order/acquiring')
    // @ApiOperation({ summary: 'Dana Order Acquiring | Backofffice' })
    // async acquiringOrder(@Res() res, @Req() req) {
    //     const result = await this.danaService.acquiringOrder(req)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Syncron to Data',
	// 		data: result
	// 	});
    // }

    // @Post('order/agreementpay')
    // @ApiOperation({ summary: 'Dana Order Acquiring Agreement Pay | Backofffice' })
    // async acquiringAgreementPay(@Res() res, @Body() input: DanaOrderDTO) {
    //     const result = await this.danaService.acquiringAgreementPay(input)

	// 	return res.status(HttpStatus.OK).json({
	// 		statusCode: HttpStatus.OK,
	// 		message: 'Syncron to Data',
	// 		data: result
	// 	});
    // }
    
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
