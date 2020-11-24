import { 
    Controller, 
    Post,
    UseGuards,
    Get,
    Put,
    Param,
    Body,
    Query,
    Delete
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

import { OrderDto, SearchDTO } from './dto/order.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

var adminRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags('Orders_BC')
@UseGuards(RolesGuard)
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
    @ApiOperation({ summary: 'Store from the cart to order | Client' })

    async storeCart(@User() user: IUser, @Body() orderDto: OrderDto) {
        return await this.orderService.store(user, orderDto)
    }

    /**
     * @route   GET api/v1/order/list
     * @desc    Get Orders
     * @access  Public
     */
    @Get('list')
    @UseGuards(JwtGuard)
	@Roles(...adminRole)
    @ApiOperation({ summary: 'Store from the cart to order | Free' })

    async findAll() {
        return await this.orderService.findAll()
    }

    /**
     * @route   GET api/v1/order/:order_id/detail
     * @desc    Oorder Detail
     * @access  Public
     */
    @Get(':order_id/detail')
    @UseGuards(JwtGuard)
	@Roles(...adminRole)
    @ApiOperation({ summary: 'Store from the cart to order | Free' })

    async findById(@Param('order_id') order_id: string) {
        return await this.orderService.findById(order_id)
    }

    /**
     * @route   GET api/v1/order/:order_id/user
     * @desc    Get order by UserId
     * @access  Public
     */
    @Get(':user_id/user')
    @UseGuards(JwtGuard)
	@Roles(...adminRole)
    @ApiOperation({ summary: 'Store from the cart to order | Backoffice' })

    async findByUser(@Param('user_id') user_id: string) {
        return await this.orderService.findByUser(user_id)
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
    @ApiOperation({ summary: 'Update Order Status by id | Backoffice' })
    
    @ApiQuery({
		name: 'status',
		required: true,
		explode: true,
		type: String,
        isArray: false
    })
    
	async update(@Param('order_id') order_id: string, @Query('status') status: string) {
		return await this.orderService.updateById(order_id, status)
    }
    
    /**
     * @route   DELETE api/v1/order/:order_id/delete
     * @desc    Delete a order
     * @access  Public
     */
    @Delete(':order_id/delete')
    @UseGuards(JwtGuard)
	@Roles("SUPERADMIN", "IT", "ADMIN", "USER")
    @ApiOperation({ summary: 'Update Order Status by id | Backoffice & Client' })

    async purge(@Param('order_id') order_id: string) {
        return await this.orderService.drop(order_id)
    }

    /**
     * @route   GET api/v1/order/self
     * @desc    Get User order
     * @access  Public
     */
    @Get('self')
    @UseGuards(JwtGuard)
	@Roles("USER")
    @ApiOperation({ summary: 'Get Order User | Client' })

    async myOrder(@User() user: IUser) {
        return await this.orderService.myOrder(user)
    }
}
