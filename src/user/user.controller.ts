import { 
    Controller,
    Post,
    Body,
    Res,
    HttpStatus
} from '@nestjs/common';
import {
    ApiTags,
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
    @ApiOperation({ summary: 'User Registration' })
    async userRegister(@Res() res, @Body() createUserDTO: CreateUserDTO) {
        const user = await this.userService.createUser(createUserDTO);
        return res.status(HttpStatus.CREATED).json({
            message: 'User successfully created.',
            user
        });
    }
}
