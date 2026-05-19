import { Controller, Post, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateReportDto } from './dto/update-report.dto';
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

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get dynamic schedules based on logged in user role (Patient/Doctor/Admin)' })
  @ApiResponse({ status: 200, description: 'Successfully fetched dynamic appointments calendar.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patient/Doctor/Admin role required).' })
  public async findMy(@Req() req: any) {
    const userId = req.user.id;
    const role = req.user.role;
    return this.appointmentsService.findMyAppointments(userId, role);
  }

  @Patch(':id/report')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.DOCTOR)
  @ApiOperation({ summary: 'Update consultation report with diagnosis and prescription (Doctor only)' })
  @ApiResponse({ status: 200, description: 'Appointment report successfully updated and completed.' })
  @ApiResponse({ status: 400, description: 'Invalid input data or unauthorized access.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Doctor role required).' })
  @ApiResponse({ status: 404, description: 'Appointment not found.' })
  public async updateReport(
    @Param('id') id: string,
    @Req() req: any,
    @Body() updateReportDto: UpdateReportDto,
  ) {
    const doctorId = req.user.id;
    return this.appointmentsService.updateReport(id, doctorId, updateReportDto);
  }
}
