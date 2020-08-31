import { 
    Controller,
    UseGuards,
    Post,
    Body
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CreateProfileDTO } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags('User Profiles')
@Controller('api/v1/users/profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {}

     /**
     * @route   POST api/v1/users/profile
     * @desc    Add a user profile
     * @access  Public
     */
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({ summary: 'Add a user profile' })
    async userAddProfile(@Body() createProfileDTO: CreateProfileDTO, @User() user: IUser) {
        return await this.profileService.createProfile(createProfileDTO, user);
    }
}
