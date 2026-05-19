import { Module } from '@nestjs/common';
import { PatientsController } from './patients.controller';
import { AppointmentsModule } from '../appointments/appointments.module';

@Module({
  imports: [AppointmentsModule],
  controllers: [PatientsController],
})
export class PatientsModule {}
