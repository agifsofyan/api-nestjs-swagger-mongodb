import { 
    Controller,
    UseGuards,
    Post,
    Put,
    Body,
    Get,
    Param
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiBearerAuth
} from '@nestjs/swagger';
import { JwtGuard } from '../auth/guards/jwt.guard';

import { CreateProfileDTO } from './dto/create-profile.dto';
import { CreateProfileExperienceDTO } from './dto/create-profile-experience.dto';
import { CreateProfileAchievementDTO } from './dto/create-profile-achievement.dto';
import { ProfileService } from './profile.service';
import { User } from '../user/user.decorator';
import { IUser } from '../user/interfaces/user.interface';
import { CreateProfileAddressDTO } from './dto/create-profile-address.dto';
import { Roles } from '../auth/decorators/roles.decorator';

var inRole = ["USER"];

@ApiTags("Profile_BC")
@Controller('users/profile')
export class ProfileController {
    constructor(private profileService: ProfileService) {}

    /**
     * @route   POST api/v1/users/profile
     * @desc    Create and update profile
     * @access  Public
     */
    @Post()
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Add profile | Client' })

    async addUpdateProfile(@Body() createProfileDTO: CreateProfileDTO, @User() user: IUser) {
        return await this.profileService.createProfile(createProfileDTO, user);
    }

    /**
     * @route   PUT api/v1/users/profile/address
     * @desc    Add profile address
     * @access  Public
     */
    @Put('address')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Add profile address | Client' })
    async addProfileAddress(@Body() createProfileAddressDTO: CreateProfileAddressDTO, @User() user: IUser) {
        return await this.profileService.createAddress(createProfileAddressDTO, user);
    }

    /**
     * @route   PUT api/v1/users/profile/experience
     * @desc    Add profile experience
     * @access  Public
     */
    @Put('experience')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Add profile experiences | Client' })
    async addProfileExperience(@Body() createProfileExperienceDTO: CreateProfileExperienceDTO, @User() user: IUser) {
        return await this.profileService.createExperience(createProfileExperienceDTO, user);
    }

    /**
     * @route   PUT api/v1/users/profile/achievement
     * @desc    Add profile achievement
     * @access  Public
     */
    @Put('achievement')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Add profile achievements | Client' })
    async addProfileAchievement(@Body() createProfileAchievementDTO: CreateProfileAchievementDTO, @User() user: IUser) {
        return await this.profileService.createAchievement(createProfileAchievementDTO, user);
    }

    /**
     * @route   GET api/v1/users/profile
     * @desc    Get profile
     * @access  Public
     */
    @Get()
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get profile | Client' })

    async showProfile(@User() user: IUser) {
        return await this.profileService.getProfile(user);
    }

    /**
     * @route   GET api/v1/users/profile/address
     * @desc    Add profile address
     * @access  Public
     */
    @Get('address')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get all address | Client' })
    async getAddress(@User() user: IUser) {
        return await this.profileService.getAddress(user);
    }

    /**
     * @route   GET api/v1/users/profile/address/:address_id
     * @desc    Add profile address
     * @access  Public
     */
    @Get('address/:address_id')
    @UseGuards(JwtGuard)
	@Roles(...inRole)
	@ApiBearerAuth()
    @ApiOperation({ summary: 'Get address By address Id | Client' })
    async getOneAddress(@User() user: IUser, @Param('address_id') addressId: string) {
        return await this.profileService.getOneAddress(user, addressId);
    }
}
