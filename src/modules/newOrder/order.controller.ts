import { 
    Controller, 
    Post,
    UseGuards,
    Get,
    Put,
    Param,
    Body,
    Query
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

import { OrderDto, SearchDTO } from './dto/order.dto';

@ApiTags('Orders')
@Controller('orders')
export class OrderController {
    constructor(
        private orderService: OrderService
    ) {}
    
    /**
     * @route   GET api/v1/order/store
     * @desc    Create order
     * @access  Public
     */
    @Post('store')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    async storeCart(@User() user: IUser, @Body() orderDto: OrderDto) {
        return await this.orderService.store(user, orderDto)
    }

    /** For Backoffice */
    @Get('list')
    async findAll() {
        return await this.orderService.findAll()
    }

    @Get(':order_id/detail')
    async findById(@Param('order_id') order_id: string) {
        return await this.orderService.findById(order_id)
    }

    @Get(':user_id/user')
    async findByUser(@Param('user_id') user_id: string) {
        return await this.orderService.findByUser(user_id)
    }

	@Post('find/search')
	async search(@Body() search: SearchDTO) {
		return await this.orderService.search(search)
    }

	@Put(':order_id')
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Update Order Status by id' })
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
    /** For Backoffice */
}
