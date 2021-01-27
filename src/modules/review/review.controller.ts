import { Controller, UseGuards } from '@nestjs/common';
import { ReviewService } from './review.service';
import { PostReviewDTO } from './dto/review.dto';
import { verify, toSignature, createOrder } from 'src/utils/helper';
import { IUser } from '../user/interfaces/user.interface';
import { User } from '../user/user.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RolesGuard } from '../auth/guards/roles.guard';

var inRole = ["SUPERADMIN", "IT", "ADMIN"];

@ApiTags("Reviews_C")
@UseGuards(RolesGuard)
@Controller('review')
export class ReviewController {}
