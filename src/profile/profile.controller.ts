import { 
    Controller,
    UseGuards,
    Post,
    Put,
    Body
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth,
    ApiHeader
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

import { CreateProfileDTO } from './dto/create-profile.dto';
import { CreateProfileExperienceDTO } from './dto/create-profile-experience.dto';
import { CreateProfileAchievementDTO } from './dto/create-profile-achievement.dto';
import { ProfileService } from './profile.service';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';

@ApiTags('User Profiles')
@Controller('users/profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {}

    /**
     * @route   POST api/v1/users/profile
     * @desc    Create and update profile
     * @access  Public
     */
    @Post()
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add profile' })
    @ApiHeader({
        name: 'Bearer',
        description: 'Token authentication.'
    })
    async createUpdateProfile(@Body() createProfileDTO: CreateProfileDTO, @User() user: IUser) {
        return await this.profileService.createUpdate(createProfileDTO, user);
    }

    /**
     * @route   POST api/v1/users/profile/experience
     * @desc    Add profile experience
     * @access  Public
     */
    @Put('experience')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add profile experiences' })
    @ApiHeader({
        name: 'Bearer',
        description: 'Token authentication.'
    })
    async addProfileExperience(@Body() createProfileExperienceDTO: CreateProfileExperienceDTO, @User() user: IUser) {
        return await this.profileService.createExperience(createProfileExperienceDTO, user);
    }

    /**
     * @route   POST api/v1/users/profile/achievement
     * @desc    Add profile achievement
     * @access  Public
     */
    @Put('achievement')
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Add profile achievements' })
    @ApiHeader({
        name: 'Bearer',
        description: 'Token authentication.'
    })
    async addProfileAchievement(@Body() createProfileAchievementDTO: CreateProfileAchievementDTO, @User() user: IUser) {
        return await this.profileService.createAchievement(createProfileAchievementDTO, user);
    }
}
