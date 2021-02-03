import { Controller, Get, Query, UseGuards, Res, HttpService, Post, Body, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

import { RolesGuard } from '../auth/guards/roles.guard';
import { ZoomService } from './zoom.service';
import { CreateZoomWebinar } from './dto/zoom.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtGuard } from '../auth/guards/jwt.guard';

var inRole = ["IT", "ADMIN", "SUPERADMIN"]

// @ApiTags("Zoom_B")
@UseGuards(RolesGuard)
@Controller('zooms')
export class ZoomController {
    constructor(private readonly zoomService: ZoomService, private readonly httpService: HttpService) {}

    /**
     * @route   POST api/v1/webinar/create
     * @desc    Get Calculate Cost
     * @access  Public
     */
    @Post('webinar/create')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create Webinar | Backoffice' })
    async cost(@Res() res, @Body() input: CreateZoomWebinar) {
        const result = await this.zoomService.createWebinar(input)
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: 'Syncron to Data',
			data: result
		});
    }
}
