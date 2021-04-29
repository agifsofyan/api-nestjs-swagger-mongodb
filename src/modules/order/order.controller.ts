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
    HttpStatus,
    Req
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiQuery, ApiBearerAuth, ApiParam } from '@nestjs/swagger';

import { OrderService } from './services/order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

import { OrderDto, PaymentOrder, PaymentVendor, StatusOrder } from './dto/order.dto';
import { AddBonusDTO } from './dto/add-bonus.dto';
import { OrderPayDto } from './dto/pay.dto';
import { UniqueGenerateDto, VACallbackDto } from './dto/unique.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OrderCrudService } from './services/crud.service';
import { OrderNotifyService } from './services/notify.service';
import { ConfirmDTO } from './dto/confirm.dto';

var adminRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags('Orders')
@UseGuards(RolesGuard)
@Controller('orders')
export class OrderController {
    constructor(
        private orderService: OrderService,
        private crudService: OrderCrudService,
        private notifyService: OrderNotifyService,
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
			message: `Success create new order. & ${result.mail}`,
			data: result.order
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
        name: 'limit',
        example: 10,
		required: false,
		explode: true,
		type: Number,
        isArray: false
	})

	@ApiQuery({
        name: 'offset',
        example: 1,
		required: false,
		explode: true,
		type: Number,
		isArray: false
    })
    
    @ApiQuery({
		name: 'payment_method',
		required: false,
		explode: true,
		type: String,
        isArray: false,
        enum: PaymentOrder
    })

    @ApiQuery({
		name: 'payment_vendor',
		required: false,
		explode: true,
		type: String,
        isArray: false,
        enum: PaymentVendor
    })
    
    @ApiQuery({
		name: 'order_status',
		required: false,
		explode: true,
		type: String,
        isArray: false,
        enum: StatusOrder
    })
    
    @ApiQuery({
		name: 'invoice_number',
		required: false,
		explode: true,
		type: String,
        isArray: false
	})

    @ApiQuery({
		name: 'utm',
		required: false,
		explode: true,
		type: String,
        example: "facebook",
        description: "utm name",
        isArray: false
	})

    async findAll(
        @Req() req, 
        @Res() res,
        @Query('payment_method') payment_method: string,
        @Query('payment_vendor') payment_vendor: string,
        @Query('order_status') order_status: string,
        @Query('invoice_number') invoice_number: string,
        @Query('utm') utm: string,
    ) {
        const result = await this.crudService.findAll(
            req.query, payment_method, payment_vendor, order_status, invoice_number, utm
        )
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
    @ApiOperation({ summary: 'Update order status by Order ID | Backoffice' })

    @ApiParam({
		name: 'order_id',
		required: true,
		explode: true,
		type: String,
		example: '602260d5f32f710b08660ecc',
		description: 'Order ID'
	})
    
    @ApiQuery({
		name: 'status',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        example: 'PAID',
        enum: StatusOrder
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
     * @route   PUT api/v1/orders?invoice_number:invoice_number
     * @desc    Update Order
     * @access  Public
     */
	@Put()
	@UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update order status by Invoice | Backoffice' })
    
    @ApiQuery({
		name: 'invoice_number',
        example: '241120SKU3372506',
		required: true,
		explode: false,
		type: String,
        isArray: false
    })

    @ApiQuery({
		name: 'status',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        example: 'PAID',
        enum: StatusOrder
    })
    
	async updateStatusByInvoice(
        @Query('invoice_number') invoice_number: string, 
        @Query('status') status: string, 
        @Res() res
    ) {
        const result = await this.crudService.updateStatusByInvoice(invoice_number, status)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success Change order status.',
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

    @ApiParam({
		name: 'order_id',
		required: true,
		explode: true,
		type: String,
		example: '602260d5f32f710b08660ecc',
		description: 'Order ID'
	})

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

    @ApiQuery({
		name: 'status',
		required: false,
		explode: true,
		type: String,
        isArray: false,
        example: 'PENDING',
        enum: StatusOrder
    })

    @ApiQuery({
		name: 'inStatus',
		required: false,
		explode: true,
		type: Boolean,
        isArray: false
    })

    @ApiQuery({
		name: 'isSubscribe',
		required: false,
		explode: true,
		type: Boolean,
        isArray: false
    })

    async myOrder(
        @Query('status') status: string,
        @Query('inStatus') inStatus: boolean,
        @Query('isSubscribe') isSubscribe: boolean,
        @User() user: IUser, 
        @Res() res 
    ) {
        const result = await this.crudService.myOrder(user, status, inStatus, isSubscribe)

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

    @ApiParam({
		name: 'order_id',
		required: true,
		explode: true,
		type: String,
		example: '602260d5f32f710b08660ecc',
		description: 'Order ID'
	})

    async pay(@User() user: IUser,  @Param('order_id') order_id: string, @Body() input: OrderPayDto, @Res() res) {
        const result = await this.orderService.pay(user, order_id, input)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success pay to payment.',
			data: result
		});
    }

    /**
     * @route   POST api/v1/orders/confirm
     * @desc    Payment Confirmation
     * @access  Public
    */
   
    @Post('confirm')
    @UseGuards(JwtGuard)
    @Roles("USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Confirm the payment | Client - Private' })

    async confirm(@User() user: IUser, @Body() input: ConfirmDTO, @Res() res) {
        input.user_id = user._id
        const result = await this.notifyService.confirm(input)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success confirm the payment.',
			data: result
		});
    }

    /**
     * @route   POST api/v1/orders/unique
     * @desc    Update order to create payment and Pay
     * @access  Public
     */
    @Post('unique')
    @UseGuards(JwtGuard)
    @Roles("USER")
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate unique number | Client' })

    async unique(
        @User() user: IUser,
        @Body() input: UniqueGenerateDto, 
        @Res() res
    ) {
        const {order_id} = input
        const result = await this.orderService.unique(user, order_id)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success generate unique number.',
			data: result
		});
    }

    /**
     * @route   PUT api/v1/orders/:order_id/detail
     * @desc    Update Order
     * @access  Public
     */
	@Get(':order_id/detail')
	@UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get order Detail | Backoffice' })

    @ApiParam({
		name: 'order_id',
		required: true,
		explode: true,
		type: String,
		example: '602260d5f32f710b08660ecc',
		description: 'Order ID'
	})
    
	async detail(@Param('order_id') order_id: string, @Res() res) {
        const result = await this.crudService.detail(order_id)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success get order detail.',
			data: result
		});
    }

    /**
     * @route   PUT api/v1/orders/:invoice_number/add-bonus/:product_id
     * @desc    Add new Bonus to use class
     * @access  Public
     */
	@Put(':invoice_number/add-bonus')
	@UseGuards(JwtGuard)
    @Roles(...adminRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add bonus | Backoffice' })

    @ApiParam({
		name: 'invoice_number',
		required: true,
		explode: true,
		type: String,
		example: '23221SKU7743165',
		description: 'Invoice Number'
	})
    
	async addBonus(
        @Param('invoice_number') invoice_number: string,
        @Body() input: AddBonusDTO,
        @Res() res
    ) {
        const result = await this.orderService.addBonus(invoice_number, input)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Success add bonus.',
			data: result
		});
    }
}
