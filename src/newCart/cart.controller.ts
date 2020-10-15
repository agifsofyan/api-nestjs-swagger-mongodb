import { 
    Controller,
    Get,
    Post,
    Delete,
    Query,
    Session,
    Req,
    UseGuards
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiQuery,
    ApiBearerAuth
} from '@nestjs/swagger';

import { CartService } from './cart.service';
import { ICart } from './interfaces/cart.interface';
import { IdProductDTO } from './dto/cart.dto';
import { UserGuard } from '../auth/guards/user.guard';
import { request } from 'http';

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
		name: 'id',
		required: true,
		explode: true,
		type: String,
		isArray: false
	})
    async addToCart(@Req() req, @Session() session, @Query() cartDTO: IdProductDTO): Promise<ICart> {
        const user = req.user

        if(user != null){
            const userId = user.userId
        }
        console.log('session-C:', session)
        // const { newCart } = await this.cartService.add(session, cartDTO);
        // session.cart = newCart;
        // return newCart;
        return null
    }
}
