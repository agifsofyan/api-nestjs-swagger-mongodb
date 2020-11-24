import { 
    Controller, 
    Post,
    UseGuards,
    Get,
    Put,
    Param,
    Body,
    Query,
    Delete,
    Res,
    HttpStatus
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

import { OrderDto, SearchDTO } from './dto/order.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

var adminRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags('Orders_BC')
@Controller('orders')
export class OrderController {
    constructor(
        private orderService: OrderService
    ) {}
    
    /**
     * @route   POST api/v1/order/store
     * @desc    Create order
     * @access  Public
     */
    @Post('store')
    @UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Store from the cart to order | Client' })

    async storeCart(@User() user: IUser, @Body() orderDto: OrderDto, @Res() res) {
        const result = await this.orderService.store(user, orderDto)

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Success get order list.',
			data: result
		});
    }

    /**
     * @route   GET api/v1/order/list
     * @desc    Get Orders
     * @access  Public
     */
    @Get('list')
    @UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Order List | Backoffice' })

    async findAll(@Res() res) {
        const result = await this.orderService.findAll()
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'Success get order list.',
            total: result.length,
			data: result
		});
    }

    /**
     * @route   GET api/v1/order/:order_id/detail
     * @desc    Oorder Detail
     * @access  Public
     */
    @Get(':order_id/detail')
    @UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Order Detail | Backoffice' })

    async findById(@Param('order_id') order_id: string, @Res() res) {
        const result = await this.orderService.findById(order_id)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get order detail.',
			data: result
		});
    }

    /**
     * @route   GET api/v1/order/:order_id/user
     * @desc    Get order by UserId
     * @access  Public
     */
    @Get(':user_id/user')
    @UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Order by UserID | Backoffice' })

    async findByUser(@Param('user_id') user_id: string, @Res() res) {
        const result = await this.orderService.findByUser(user_id)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get order list.',
			data: result
		});
    }

    // /**
    //  * @route   GET api/v1/order/find/search
    //  * @desc    Search order
    //  * @access  Public
    //  */
	// @Post('find/search')
	// async search(@Body() search: SearchDTO) {
	// 	return await this.orderService.search(search)
    // }

    /**
     * @route   PUT api/v1/order/:order_id/status
     * @desc    Update Order
     * @access  Public
     */
	@Put(':order_id')
	@UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update order status | Backoffice' })
    
    @ApiQuery({
		name: 'status',
		required: true,
		explode: true,
		type: String,
        isArray: false
    })
    
	async update(@Param('order_id') order_id: string, @Query('status') status: string, @Res() res) {
        const result = await this.orderService.updateById(order_id, status)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success Update order status.',
			data: result
		});
    }
    
    /**
     * @route   DELETE api/v1/order/:order_id/delete
     * @desc    Delete a order
     * @access  Public
     */
    @Delete(':order_id/delete')
    @UseGuards(JwtGuard)
    @Roles("SUPERADMIN", "IT", "ADMIN", "USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update Order Status by id | Backoffice & Client' })

    async purge(@Param('order_id') order_id: string, @Res() res) {
        const result = await this.orderService.drop(order_id)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success delete a order.',
			data: result
		});
    }

    /**
     * @route   GET api/v1/order/self
     * @desc    Get User order
     * @access  Public
     */
    @Get('self')
    @UseGuards(JwtGuard)
    @Roles("USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Order in client | Client' })

    async myOrder(@User() user: IUser, @Res() res) {
        const result = await this.orderService.myOrder(user)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get order.',
			data: result
		});
    }
}
