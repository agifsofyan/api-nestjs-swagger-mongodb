import { 
    Controller,
    Get,
    Post,
    Delete,
    Query,
    Req,
    UseGuards,
    HttpStatus,
    Res,
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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { addCartDTO } from './dto/cart.dto';

var inRole = ["USER"];

@ApiTags("Carts")
@UseGuards(RolesGuard)
@Controller('carts')
export class CartController {
    constructor(private cartService: CartService) {}

    /**
     * @route   POST api/v1/carts/add
     * @desc    Add product to cart
     * @access  Public
     */
    @Post('/add')
    //@UseGuards(UserGuard)
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add product to cart | Client' })
    // @ApiQuery({
	// 	name: 'product_id',
	// 	required: true,
	// 	explode: true,
	// 	type: String,
	// 	isArray: false
	// })
    async addToCart(@Req() req, @Body() input: addCartDTO, @Res() res) {
	    const user = req.user
        const query = await this.cartService.add(user, input)

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: query.msg || 'Add product to cart is successful.',
			data: query.result
		});
    }

    /**
     * @route   GET api/v1/carts/list
     * @desc    Get active carts list
     * @access  Public
     */
    @Get('list')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get the cart | Client' })
    async getFromCart(@Req() req, @Res() res) {
        const result = await this.cartService.getMyItems(req.user)
        
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'get cart list is successful.',
            ttl_items: result.items.length,
			data: result
		});
    }

    /**
     * @route   GET api/v1/carts/remove?product_id=:product_id
     * @desc    Remove product from cart
     * @access  Public
     */

    @Delete('remove')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete item from the cart | Client' })
    @ApiQuery({
		name: 'product_id',
		required: true,
		explode: true,
		type: String,
        isArray: true,
        example: '5fbb7c52b50b58001eeb76b5'
	})
    async removeCart(@Req() req, @Query('product_id') product_id: any, @Res() res) {
        const user = req.user
        const result = await this.cartService.purgeItem(user, product_id)

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'remove items from the cart is successful.',
			data: result
		});
    }
}
