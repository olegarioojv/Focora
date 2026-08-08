import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { ReviewsService } from './reviews.service';
import { CreateReviewsBatchDto } from './dto/create-reviews-batch.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@UseGuards(JwtAuthGuard)
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.findAll(user.id);
  }

  @Post()
  createBatch(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReviewsBatchDto,
  ) {
    return this.reviewsService.createBatch(user.id, dto);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateReviewDto,
  ) {
    return this.reviewsService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', new ParseUUIDPipe()) id: string,
  ) {
    return this.reviewsService.remove(user.id, id);
  }
}
