import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateReportDto } from './dto/update-report.dto';
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

  public async findMyAppointments(userId: string, role: UserRole): Promise<Appointment[]> {
    let appointments: Appointment[] = [];

    if (role === UserRole.PATIENT) {
      appointments = await this.appointmentRepository.find({
        where: { patientId: userId },
        relations: { doctor: true },
        order: { appointmentDate: 'ASC' },
      });
      appointments.forEach(app => {
        if (app.doctor) {
          const { password, ...doctorWithoutPassword } = app.doctor;
          app.doctor = doctorWithoutPassword as any;
        }
      });
    } else if (role === UserRole.DOCTOR) {
      appointments = await this.appointmentRepository.find({
        where: { doctorId: userId },
        relations: { patient: true },
        order: { appointmentDate: 'ASC' },
      });
      appointments.forEach(app => {
        if (app.patient) {
          const { password, ...patientWithoutPassword } = app.patient;
          app.patient = patientWithoutPassword as any;
        }
      });
    } else {
      appointments = await this.appointmentRepository.find({
        relations: { patient: true, doctor: true },
        order: { appointmentDate: 'ASC' },
      });
      appointments.forEach(app => {
        if (app.patient) {
          const { password, ...patientWithoutPassword } = app.patient;
          app.patient = patientWithoutPassword as any;
        }
        if (app.doctor) {
          const { password, ...doctorWithoutPassword } = app.doctor;
          app.doctor = doctorWithoutPassword as any;
        }
      });
    }

    return appointments;
  }

  public async updateReport(appointmentId: string, doctorId: string, updateReportDto: UpdateReportDto): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } });
    if (!appointment) {
      throw new NotFoundException(`Appointment with ID ${appointmentId} not found.`);
    }

    if (appointment.doctorId !== doctorId) {
      throw new BadRequestException('You are not authorized to update reports for other doctors\' appointments.');
    }

    appointment.diagnosis = updateReportDto.diagnosis;
    appointment.prescription = updateReportDto.prescription;
    appointment.status = AppointmentStatus.COMPLETED;

    return await this.appointmentRepository.save(appointment);
  }

  public async getPatientMedicalHistory(patientId: string): Promise<Appointment[]> {
    const patientUser = await this.usersService.findOneById(patientId);
    if (!patientUser) {
      throw new NotFoundException(`Patient with ID ${patientId} not found.`);
    }

    if (patientUser.role !== UserRole.PATIENT) {
      throw new BadRequestException(`User with ID ${patientId} is not a Patient.`);
    }

    const appointments = await this.appointmentRepository.find({
      where: { patientId },
      relations: { doctor: true },
      order: { appointmentDate: 'DESC' },
    });

    appointments.forEach(app => {
      if (app.doctor) {
        const { password, ...doctorWithoutPassword } = app.doctor;
        app.doctor = doctorWithoutPassword as any;
      }
    });

    return appointments;
  }
}
