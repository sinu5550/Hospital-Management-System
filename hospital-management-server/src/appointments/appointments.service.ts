import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UsersService } from '../users/users.service';
import { UserRole } from '../common/enums/role.enum';
import { AppointmentStatus } from '../common/enums/appointment-status.enum';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    private readonly usersService: UsersService,
  ) {}

  public async create(patientId: string, createAppointmentDto: CreateAppointmentDto): Promise<Appointment> {
    const { appointmentDate, doctorId } = createAppointmentDto;

    const dateToBook = new Date(appointmentDate);
    if (isNaN(dateToBook.getTime())) {
      throw new BadRequestException('Invalid appointment date format.');
    }

    if (dateToBook <= new Date()) {
      throw new BadRequestException('Appointment date must be scheduled in the future.');
    }

    const doctor = await this.usersService.findOneById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${doctorId} not found.`);
    }

    if (doctor.role !== UserRole.DOCTOR) {
      throw new BadRequestException(`User with ID ${doctorId} is not registered as a Doctor.`);
    }

    const appointment = this.appointmentRepository.create({
      appointmentDate: dateToBook,
      doctorId,
      patientId,
      status: AppointmentStatus.SCHEDULED,
    });

    return await this.appointmentRepository.save(appointment);
  }
}
