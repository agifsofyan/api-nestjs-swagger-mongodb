import { 
    Controller,
    Post,
    Res,
    HttpStatus,
    Body
} from '@nestjs/common';

import { CreateUserDTO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('api/v1/users')
export class UserController {
    constructor(private userService: UserService) {}

    /**
     * @route   POST /api/v1/users/register
     * @desc    Create a new user
     * @access  Public
     */
    @Post('/register')
    async userRegister(@Res() res, @Body() createUserDTO: CreateUserDTO) {
        const user = await this.userService.createUser(createUserDTO);
        return res.status(HttpStatus.OK).json({
            message: 'success.',
            user: user
        });
    }
}
