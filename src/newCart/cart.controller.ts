import { 
    Controller,
    Get,
    Post,
    Delete,
    Query,
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
import { UserGuard } from '../auth/guards/user.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { addCartDTO, ArrayIdDTO } from './dto/cart.dto';

@ApiTags('Carts')
@Controller('carts')
export class CartController {
    constructor(private cartService: CartService) {}

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

    /**
     * @route   GET api/v1/carts/list
     * @desc    Get active carts list
     * @access  Public
     */
    @Get('list')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    async getFromCart(@Req() req) {
	    return await this.cartService.getMyItems(req.user)
    }

    /**
     * @route   GET api/v1/carts/remove?product_id=:product_id
     * @desc    Remove product from cart
     * @access  Public
     */

    @Delete('remove')
    @UseGuards(JwtGuard)
    @ApiBearerAuth()
    @ApiQuery({
		name: 'product_id',
		required: true,
		explode: true,
		type: String,
		isArray: false
	})
    async removeCart(@Req() req, @Query('product_id') product_id: any) {
        console.log('product_id', product_id)
        const user = req.user
        return await this.cartService.purgeItem(user, product_id)
    }
}
