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

import { OrderService } from './services/order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

import { OrderDto, SearchDTO } from './dto/order.dto';
import { OrderPayDto } from './dto/pay.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserOrderService } from './services/userorder.service';
import { CRUDService } from './services/crud.service';

var adminRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags('Orders_BC')
@UseGuards(RolesGuard)
@Controller('orders')
export class OrderController {
    constructor(
        private orderService: OrderService,
        private userOrderService: UserOrderService,
        private crudService: CRUDService
    ) {}
    
    /**
     * @route   POST api/v1/orders/store
     * @desc    Create order
     * @access  Public
     */
    @Post('store')
    @UseGuards(JwtGuard)
    @Roles("USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Store from the cart to order | Client' })

    async storeCart(@User() user: IUser, @Body() orderDto: OrderDto, @Res() res) {
        const result = await this.orderService.store(user, orderDto)

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Success create new order.',
			data: result
		});
    }

    /**
     * @route   GET api/v1/orders/list
     * @desc    Get Orders
     * @access  Public
     */
    @Get('list')
    @UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Order List | Backoffice' })

    async findAll(@Res() res) {
        const result = await this.crudService.findAll()
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'Success get order list.',
            total: result.length,
			data: result
		});
    }

    /**
     * @route   PUT api/v1/orders/:order_id/status
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
        isArray: false,
        example: 'PAID'
    })
    
	async update(@Param('order_id') order_id: string, @Query('status') status: string, @Res() res) {
        const result = await this.crudService.updateStatus(order_id, status)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success Update order status.',
			data: result
		});
    }
    
    /**
     * @route   DELETE api/v1/orders/:order_id/delete
     * @desc    Delete a order
     * @access  Public
     */
    @Delete(':order_id/delete')
    @UseGuards(JwtGuard)
    @Roles("SUPERADMIN", "IT", "ADMIN", "USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update Order Status by id | Backoffice & Client' })

    async purge(@Param('order_id') order_id: string, @Res() res) {
        const result = await this.crudService.drop(order_id)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success delete a order.',
			data: result
		});
    }

    /**
     * @route   GET api/v1/orders/self
     * @desc    Get User order
     * @access  Public
     */
    @Get('self')
    @UseGuards(JwtGuard)
    @Roles("USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get Order in client | Client' })

    async myOrder(@User() user: IUser,  @Res() res) {
        const result = await this.crudService.myOrder(user)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get order.',
            total: result.length,
			data: result
		});
    }

    /**
     * @route   POST api/v1/orders/:order_id/pay
     * @desc    Update order to create payment and Pay
     * @access  Public
     */
    @Post(':order_id/pay')
    @UseGuards(JwtGuard)
    @Roles("USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Pay to payment method | Client' })

    async pay(@User() user: IUser,  @Param('order_id') order_id: string, @Body() input: OrderPayDto, @Res() res) {
        const result = await this.userOrderService.pay(user, order_id, input)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success pay to payment.',
			data: result
		});
    }
}
