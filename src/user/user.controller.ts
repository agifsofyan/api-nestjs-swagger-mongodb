import { 
    Controller,
    Post,
    Body,
    Req,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';

import { UserRegisterDTO } from './dto/register.dto';
import { UserLoginDTO } from './dto/login.dto';
import { RefreshAccessTokenDTO } from './dto/refresh-access-token.dto';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('api/v1/users')
export class UserController {
    constructor(private userService: UserService) {}

    /**
     * @route   POST /api/v1/users
     * @desc    Create a new user
     * @access  Public
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'User Registration' })
    async userRegister(@Body() userRegisterDTO: UserRegisterDTO) {
        return await this.userService.userRegister(userRegisterDTO);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'User Login' })
    async userlogin(@Req() req: FastifyRequest, @Body() userLoginDTO: UserLoginDTO) {
        return await this.userService.userLogin(req, userLoginDTO);
    }

    @Post('refresh-access-token')
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Refresh Access Token' })
    async refreshAccessToken(@Body() refreshAccessTokenDto: RefreshAccessTokenDTO) {
        return await this.userService.refreshAccessToken(refreshAccessTokenDto);
    }
}
