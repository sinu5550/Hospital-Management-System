import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('Appointments')
@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT)
  @ApiOperation({ summary: 'Book a consultation (Patient only)' })
  @ApiResponse({ status: 201, description: 'Appointment successfully booked.' })
  @ApiResponse({ status: 400, description: 'Invalid input or date.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient role required).' })
  @ApiResponse({ status: 404, description: 'Doctor not found.' })
  public async create(@Req() req: any, @Body() createAppointmentDto: CreateAppointmentDto) {
    const patientId = req.user.id;
    return this.appointmentsService.create(patientId, createAppointmentDto);
  }
}
