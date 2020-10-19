import { 
    Controller,
    Get,
    Post,
    Delete,
    Query,
    Session,
    Req,
    UseGuards,
    Body
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';

import { CartService } from './cart.service';
import { ICart } from './interfaces/cart.interface';
import { addCartDTO, modifyCartDto } from './dto/cart.dto';
import { UserGuard } from '../auth/guards/user.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
// import { request } from 'http';

@ApiTags('Carts')
@Controller('carts')
export class CartController {
    constructor(private cartService: CartService) {}

    /**
     * @route   GET api/v1/carts
     * @desc    Get users cart based on their session
     * @access  Public
     */
    // @Get()
    // @UseGuards(UserGuard)
    // @ApiBearerAuth()
    // @ApiOperation({ summary: 'Get cart items based on their session' })
    // async getCart(@Session() session, @Req() req) {
    //     console.log('req-user:', req.user)
    //     return await this.cartService.fetch(session);
    // }

    /**
     * @route   GET api/v1/carts/add
     * @desc    Add product to cart
     * @access  Public
     */
    @Post('/add')
    @UseGuards(UserGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add product to cart' })
    @ApiQuery({
		name: 'product_id',
		required: true,
		explode: true,
		type: String,
		isArray: false
	})
    async addToCart(@Req() req, @Query('product_id') product_id: string) {
	    const user = req.user
        return await this.cartService.add(user, product_id)
    }

    @Get('list')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    async getFromCart(@Req() req) {
	    return await this.cartService.getMyItems(req.user)
    }

    @Post('store')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    async storeCart(@Req() req, @Body('items') modifyCartDto: modifyCartDto) {
        const user = req.user
        return await this.cartService.store(user, modifyCartDto)
    }
}
