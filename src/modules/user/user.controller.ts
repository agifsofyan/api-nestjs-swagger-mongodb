import { 
    Controller,
    Post,
    Put,
    Get,
    Body,
    UseGuards,
    Res,
    Req,
    HttpStatus,
    Query
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiQuery
} from '@nestjs/swagger';

import { UserRegisterDTO } from './dto/user-register.dto';
import { UserLoginDTO } from './dto/user-login.dto';
import { UserService } from './user.service';
import { UserChangePasswordDTO } from './dto/user-change-password.dto';
import { User } from './user.decorator';
import { IUser } from './interfaces/user.interface';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { newPasswordDTO } from './dto/user-account.dto';

var inRole = ["USER"];

@ApiTags("Users")
@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    /**
	 * @route   Get api/v1/users/check-account
	 * @desc    Check OTP exists
	 * @access  Public
	 */

    @Get('check-account')
    @ApiOperation({ summary: 'Check Account exists | Free' })
    
    @ApiQuery({
		name: 'email',
		required: false,
		explode: true,
		type: String,
        isArray: false,
        example: 'kirana@gmail.com'
    })

    @ApiQuery({
		name: 'otp',
		required: false,
		explode: true,
		type: String,
        isArray: false,
        example: '435678'

    })

	async checkAccount(@Res() res,  @Query('email') email: string, @Query('otp') otp: string) {
		const result = await this.userService.checkAccount(email, otp)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
            message: 'account is valid',
            data: result
        });
    }

    /**
     * @route   POST api/v1/users
     * @desc    Create a new user
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'User registration' })
    async register(@Body() userRegisterDTO: UserRegisterDTO, @Res() res) {
        const result = await this.userService.create(userRegisterDTO);

        return res.status(HttpStatus.CREATED).json({
			statusCode: HttpStatus.CREATED,
			message: 'Registration is successful',
			data: result
		});
    }

    /**
     * @route   POST api/v1/users/login
     * @desc    Authenticate user
     * @access  Public
     */
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    async login(@Body() userLoginDTO: UserLoginDTO, @Res() res) {
        const result = await this.userService.login(userLoginDTO);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'login is successful',
			data: result
		});
    }

    /**
     * @route   Get api/v1/users/me
     * @desc    Get user data
     * @access  Public
     */
    @Get('me')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'who am i | Client' })
    
    async whoAmI(@User() user: IUser, @Res() res) {
        const result = await this.userService.whoAmI(user);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Get my data is successful',
			data: result
		});
    }

    /**
     * @route   PUT api/v1/users/change-password
     * @desc    Change user password
     * @access  Public
     */
    @Put('change-password')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password | Client' })
    async changePassword(@User() user: IUser, @Body() input: UserChangePasswordDTO, @Res() res) {
        const result = await this.userService.changePassword(user, input);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Your password has been changed',
			data: result
		});
    }

    /**
     * @route   PUT api/v1/users/change-password?email=:email
     * @desc    Request new password when forget the password
     * @access  Public
     */
    @Get('forget-password')
    @ApiOperation({ summary: 'Request new pasword when forget the password | Free' })

    @ApiQuery({
		name: 'email',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        example: 'kirana@gmail.com'
    })
    
    async forgetPassword(
        @Res() res, 
        @Query('email') email: string
    ) {    
        const result = await this.userService.forgetPassword(email);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: result
		});
    }

	/**
	 * @route   Put api/v1/users/new-password
	 * @desc    Change to new password
	 * @access  Public
	 */

    @Put('new-password')
    @ApiOperation({ summary: 'Change new password | User' })
    
    @ApiQuery({
		name: 'otp',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        example: '4356789'
    })

	async newPassword(@Res() res, @Query('otp') otp: string, @Body() input: newPasswordDTO) {
		await this.userService.newPassword(otp, input)
        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Your password has been changed',
		});
	}

    ///Verification
	/**
	 * @route   POST /api/v1/users/verification?confirmation=:confirmation&remember=true
	 * @desc    Verification & give new password - Mailgun
	 * @access  Public
	 */

	@Get('verification')
	@ApiOperation({ summary: 'Mail Verification | Free' })

	@ApiQuery({
		name: 'confirmation',
		required: true,
		explode: true,
		type: String,
        isArray: false,
        example: 'kirana@gmail.com.12343434343'
    })

	async verification(
		@Res() res,
		@Query('confirmation') confirmation: string
	) {
		const result = await this.userService.verify(confirmation)
		return res.redirect(result)
    }
}
