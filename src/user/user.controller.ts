import { 
    Controller,
    Post,
    Put,
    Body,
    Req,
    UseGuards
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiHeader
} from '@nestjs/swagger';

import { UserRegisterDTO } from './dto/register.dto';
import { UserLoginDTO } from './dto/login.dto';
import { RefreshAccessTokenDTO } from '../auth/dto/refresh-access-token.dto';
import { UserService } from './user.service';
import { ChangePasswordDTO } from './dto/change-password.dto';
import { User } from './user.decorator';
import { IUser } from './interfaces/user.interface';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('Users')
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
    async register(@Body() userRegisterDTO: UserRegisterDTO) {
        return await this.userService.create(userRegisterDTO);
    }

    /**
     * @route   POST api/v1/users/login
     * @desc    Authenticate user
     * @access  Public
     */
    @Post('login')
    @ApiOperation({ summary: 'User login' })
    async login(@Req() req, @Body() userLoginDTO: UserLoginDTO) {
        return await this.userService.login(req, userLoginDTO);
    }

    /**
     * @route   POST api/v1/users/refresh-access-token
     * @desc    Refresh user access token
     * @access  Public
     */
    @Post('refresh-access-token')
    @ApiOperation({ summary: 'Refresh access token' })
    async refreshAccessToken(@Body() refreshAccessTokenDto: RefreshAccessTokenDTO) {
        return await this.userService.refreshAccessToken(refreshAccessTokenDto);
    }

    /**
     * @route   PUT api/v1/users/change-password
     * @desc    Change user password
     * @access  Public
     */
    @Put('change-password')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change password' })
    @ApiHeader({
        name: 'Bearer',
        description: 'Token authentication.'
    })
    async changePassword(@User() user: IUser, @Body() changePasswordDTO: ChangePasswordDTO) {
        return await this.userService.changePassword(user, changePasswordDTO);
    }
}
