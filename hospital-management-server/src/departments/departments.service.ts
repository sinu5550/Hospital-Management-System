import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from './entities/department.entity.js';
import { CreateDepartmentDto } from './dto/create-department.dto.js';

@Injectable()
export class DepartmentsService {
  constructor(
    @InjectRepository(Department)
    private readonly departmentRepository: Repository<Department>,
  ) {}

  public async create(createDepartmentDto: CreateDepartmentDto) {
    const department = this.departmentRepository.create(createDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  public async findAll() {
    return await this.departmentRepository.find();
  }

  public async findOne(id: string) {
    const department = await this.departmentRepository.findOne({ where: { id } });
    if (!department) {
      throw new NotFoundException('Department not found.');
    }
    return department;
  }

  public async update(id: string, updateDepartmentDto: any) {
    const department = await this.findOne(id);
    Object.assign(department, updateDepartmentDto);
    return await this.departmentRepository.save(department);
  }

  public async remove(id: string) {
    const department = await this.findOne(id);
    return await this.departmentRepository.remove(department);
  }
}

