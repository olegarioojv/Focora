import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import {
  CurrentUser,
  type AuthenticatedUser,
} from '../auth/decorators/current-user.decorator';
import { PlanService } from './plan.service';
import { UpdatePlanDto } from './dto/update-plan.dto';

@UseGuards(JwtAuthGuard)
@Controller('plan')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  @Get()
  find(@CurrentUser() user: AuthenticatedUser) {
    return this.planService.findOrCreate(user.id);
  }

  @Patch()
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.planService.update(user.id, dto);
  }
}
