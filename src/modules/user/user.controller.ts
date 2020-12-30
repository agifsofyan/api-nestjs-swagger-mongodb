import { 
    Controller,
    Post,
    Put,
    Get,
    Body,
    Req,
    UseGuards,
    Res,
    HttpStatus
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiHeader,
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

var inRole = ["USER"];

@ApiTags("Users_C")
@UseGuards(RolesGuard)
@Controller('users')
export class UserController {
    constructor(private userService: UserService) {}

    /**
     * @route   POST api/v1/users
     * @desc    Create a new user
     * @access  Public
     */
    @Post()
    @ApiOperation({ summary: 'User registration' })
    async register(@Req() req, @Body() userRegisterDTO: UserRegisterDTO, @Res() res) {
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
    async login(@Req() req, @Body() userLoginDTO: UserLoginDTO, @Res() res) {
        const result = await this.userService.login(userLoginDTO);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'login is successful',
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
    async changePassword(@User() user: IUser, @Body() changePasswordDTO: UserChangePasswordDTO, @Res() res) {
        const result = await this.userService.changePassword(user, changePasswordDTO);

        return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Change password is successful',
			data: result
		});
    }

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
}
