import { 
    Controller, 
    Post,
    UseGuards,
    Get,
    Req,
    Res,
    HttpStatus,
    Param,
    Body
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { OrderService } from './order.service';
import { JwtGuard } from '../auth/guards/jwt.guard';

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
    async storeCart(@Req() req, @Body() orderDto: OrderDto) {
        const user = req.user
        return await this.orderService.store(user, orderDto)
    }

    // ###################
    // for Backoffice
    /**
     * @route   GET /api/v1/orders/list
     * @desc    Get all order
     * @access  Public
     */

    @Get('list')
    @ApiOperation({ summary: 'List order' })
    async findAll(@Req() req) {
        return await this.orderService.findAll(req.query)
    }

    /**
     * @route   Get /api/v1/orders/:id/detail
     * @desc    Get order by Id
     * @access  Public
     **/

    @Get(':id/detail')
    @ApiOperation({ summary: 'Detail order' })
    async findById(@Param('id') id: string) {
        // console.log('id::', id)
        return await this.orderService.findById(id)
    }

    /**
	 * @route   Post /api/v1/porders/find/search
	 * @desc    Search order
	 * @access  Public
	 **/

	@Post('find/search')
    @ApiOperation({ summary: 'List order' })
	async search(@Body() search: SearchDTO) {
		return await this.orderService.search(search)
    }
}
