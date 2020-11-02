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

    /** For Backoffice */
    @Get('list')
    async findAll(@Req() req) {
        return await this.orderService.findAll(req.query)
    }

    @Get(':id/detail')
    async findById(@Param('id') id: string) {
        return await this.orderService.findById(id)
    }

	@Post('find/search')
	async search(@Body() search: SearchDTO) {
		return await this.orderService.search(search)
    }
    /** For Backoffice */
}
