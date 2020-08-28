import { 
    UseGuards,
    Controller,
    Post,
    Body,
    HttpStatus,
    HttpCode
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CreateProfileDTO } from './dto/create-profile.dto';
import { ProfileService } from './profile.service';

@ApiTags('User Profiles')
@Controller('/api/v1/users/profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {}

    /**
     * @route   POST /api/v1/users/profile
     * @desc    Create a new profile
     * @access  Public
     */
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create User a Profile' })
    async createProfile(@Body() createProfileDTO: CreateProfileDTO) {
        return await this.profileService.createProfile(createProfileDTO);
    }
}
