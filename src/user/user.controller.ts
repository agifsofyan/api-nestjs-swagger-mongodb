import { 
    Controller,
    Post,
    Res,
    Body,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiCreatedResponse,
    ApiOkResponse,
    ApiTags,
    ApiBearerAuth,
    ApiHeader,
    ApiOperation
} from '@nestjs/swagger';

import { CreateUserDTO } from './dto/create-user.dto';
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
    @ApiCreatedResponse({})
    async userRegister(@Body() createUserDTO: CreateUserDTO) {
        return await this.userService.createUser(createUserDTO);
    }
}
