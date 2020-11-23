import {
	Controller,
	Get,
	Res,
	HttpStatus,
	Req,
	Put,
	Param,
	Query,
	Body,
	Post,
	UseGuards,
	HttpService
} from '@nestjs/common';

import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiQuery
} from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { SearchDTO } from './dto/order.dto';
import { ObjToString } from 'src/utils/StringManipulation';
import 'dotenv/config';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

var { CLIENT_API_PORT, CLIENT_IP } = process.env

var baseUrl = `http://${CLIENT_IP}:${CLIENT_API_PORT}/api/v1`;

@ApiTags('Orders - [SUPERADMIN & ADMIN]')
@UseGuards(RolesGuard)
@Controller('orders')
export class OrderController {
	constructor(private http: HttpService) { }

	@Get()
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get all order' })

	// Swagger Parameter [optional]
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

	async findAll(@Req() req, @Res() res) {
		var URL = `${baseUrl}/orders/list`

		if(req && req.query){

		   const Query = ObjToString(req.query)

		   URL = `${URL}?${Query}`
		}

		try{
			const result = await this.http.get(URL).toPromise()
			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: 'Success get orders',
				data: result.data
			})
		}catch(err){
			const {statusCode, message, error} = err.response.data
			return res.status(statusCode).json({
				statusCode: statusCode,
				message: message,
				error: error
			})
		}

    }

	/**
	 * @route    Get /api/v1/orders/:id
	 * @desc     Get order by ID
	 * @access   Public
	 */

	@Get(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Get order by id' })

	async findById(@Param('id') id: string, @Res() res)  {

		try{
			const result = await this.http.get(`${baseUrl}/orders/${id}/detail`).toPromise()

			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success get orders by id ${id}`,
				data: result.data
			})
		} catch(err) {
			const {statusCode, message, error} = err.response.data

			return res.status(statusCode).json({
				statusCode: statusCode,
				message: message,
				error: error
			})
		}
	}

	/**
	 * @route    Put /api/v1/orders/{id}?status={status}
	 * @desc     Put order by ID
	 * @access   Public
	 */

	@Put(':id')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update Order Status by id' })
	@ApiQuery({
		name: 'status',
		required: true,
		explode: true,
		type: String,
        isArray: false
	})
	
	async updateStatus(@Param('id') id: string,  @Query('status') status: string, @Res() res)  {

		try{
			const result = await this.http.put(`${baseUrl}/orders/${id}?status=${status}`).toPromise()

			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success update status`,
				data: result.data
			})
		} catch(err) {
			const {statusCode, message, error} = err.response.data
			return res.status(statusCode).json({
				statusCode: statusCode,
				message: message,
				error: error
			})
		}
	}

	/**
	 * @route   Post /api/v1/orders/find/search
	 * @desc    Search order by name
	 * @access  Public
	 **/

	@Post('find/search')
	@UseGuards(JwtAuthGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Search and show' })

	async search(@Res() res, @Body() value: SearchDTO) {
		try{
			const result = await this.http.post(`${baseUrl}/orders/find/search`, value).toPromise()

			return res.status(HttpStatus.OK).json({
				statusCode: HttpStatus.OK,
				message: `Success search order`,
				data: result.data.data
			})
		} catch(err) {
			const {statusCode, message, error} = err.response.data

			return res.status(statusCode).json({
				statusCode: statusCode,
				message: message,
				error: error
			})
		}
	}
}
