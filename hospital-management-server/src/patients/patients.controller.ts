import { Controller, Get, Param, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AppointmentsService } from '../appointments/appointments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums/role.enum';

@ApiTags('Patients')
@Controller('patients')
export class PatientsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get(':id/medical-history')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get patient medical history (Patient themselves, Doctors, or Admins)' })
  @ApiResponse({ status: 200, description: 'Medical history retrieved successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({ status: 403, description: 'Forbidden (Patients can only access their own history).' })
  @ApiResponse({ status: 404, description: 'Patient not found.' })
  public async getMedicalHistory(@Param('id') id: string, @Req() req: any) {
    if (req.user.role === UserRole.PATIENT && req.user.id !== id) {
      throw new ForbiddenException('Patients can only retrieve their own medical record history.');
    }

    return this.appointmentsService.getPatientMedicalHistory(id);
  }
}
