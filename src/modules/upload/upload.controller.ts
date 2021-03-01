import {
    Controller,
    Post,
    UseInterceptors,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    Param,
    Res,
    Get,
    Req,
    HttpStatus,
    Query,
    Delete
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiBearerAuth,
	ApiConsumes,
	ApiBody,
	ApiQuery,
	ApiParam
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service';
import { PathMediaDTO, SubPathMediaDTO } from './dto/upload.dto';

var inRole = ["SUPERADMIN", "IT", "ADMIN", "MARKETING", "SALES", "MENTOR", "USER"];

@ApiTags("Uploads")
@UseGuards(RolesGuard)
@Controller('uploads')
export class UploadController {
    constructor(private uploadService: UploadService) {}

    /**
     * * @route    Post /api/v1/upload/:path
     * * @desc     Upload
     * * @access   Public
     * */

    @Post(':path')
    @UseGuards(JwtGuard)
    @Roles(...inRole)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'File Upload | Backoffice, Client' })

	@ApiParam({
		name: 'path',
		required: true,
		explode: true,
		type: String,
		enum: PathMediaDTO,
		example: 'section',
	})

	@ApiQuery({
		name: 'sub_path',
		required: false,
		explode: true,
		type: String,
		enum: SubPathMediaDTO,
		isArray: false
	})
	
    @ApiConsumes('multipart/form-data')
    @ApiBody({
        "schema": {
            "type": "object",
            "properties": {
                "file": {
                    "type": "string",
                    "description": "Single File Upload",
                    "format": "binary"
                }
            }
        }
    })

    @UseInterceptors(FileInterceptor('file'))
    async uploadImage(
	    @Param('path') path: string,
	    @Query('sub_path') sub_path: string,
	    @UploadedFile() file: any,
	    @Res() res
    )
    {
	    const result = await this.uploadService.upload(path, file, sub_path);

	    return res.status(HttpStatus.OK).json({
		    result
	    })
    }

    /**
     * * @route    Post /api/v1/upload/:path/multiple
     * * @desc     Multiple Upload
     * * @access   Public
     * */


    // @Post(':path/multiple')
    // @UseGuards(JwtGuard)
    // @Roles(...inRole)
    // @ApiBearerAuth()
    // @ApiOperation({ summary: 'Multiple File Upload | All' })
    // @ApiConsumes('multipart/form-data')
    // @ApiBody({
    //     "schema": {
    //         "type": "object",
    //         "properties": {
    //             "file": {
    //                 "type": "array",
    //                 "items": {
    //                     "type": "string",
    //                     "description": "Single File Upload",
    //                     "format": "binary"
    //                 }
    //             }
    //         }
    //     }
    // })

    // @UseInterceptors(FilesInterceptor('file'))
    // async multipleFile(
    //     @Param('path') path: string,
	//     @UploadedFiles() file: any,
    //     @Res() res
    // ) {
    //     const result = await this.uploadService.multipleUpload(path, file);
	//     return res.status(HttpStatus.OK).json({
	// 	    result
	//     })
    //   }

    	/**
	 * @route   GET /api/v1/upload/media/list
	 * @desc    Get all media
	 * @access  Public
	 */

	@Get('media/list')
	@ApiOperation({ summary: 'Get all media | Free' })

	// Swagger Parameter [optional]
	@ApiQuery({
		name: 'sortval',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'sortby',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'limit',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})

	@ApiQuery({
		name: 'offset',
		required: false,
		explode: true,
		type: Number,
		isArray: false
	})

	@ApiQuery({
		name: 'optVal',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'optFields',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'value',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	@ApiQuery({
		name: 'fields',
		required: false,
		explode: true,
		type: String,
		isArray: false
	})

	async findAll(@Req() req, @Res() res) {

		const result = await this.uploadService.findAll(req.query);
		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success get media`,
			total: result.length,
			data: result
		});
	}

	/**
	 * @route   DELETE /api/v1/upload/delete?path={path}&filename={filename}
	 * @desc    Delete file media
	 * @access  Public
	 */
	
	@Delete('delete')
	@UseGuards(JwtGuard)
	@Roles("SUPERADMIN", "IT", "ADMIN")
	@ApiBearerAuth()
	@ApiOperation({ summary: 'Delete file media | Backoffice' })

	@ApiQuery({
		name: '_id',
		required: true,
		explode: true,
		type: String,
		isArray: true
	})

	async deleteFile(
		@Query('_id') _id: any,
		@Res() res
	) {
		const query = await this.uploadService.deleteFile(_id);

		return res.status(HttpStatus.OK).json({
			statusCode: HttpStatus.OK,
			message: `Success remove`
		});
	}
}
