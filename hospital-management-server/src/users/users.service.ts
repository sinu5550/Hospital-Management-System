import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { UserRole } from 'src/common/enums/role.enum';
import { UpdateProfileDto } from './dto/update-profile.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly entityManager: EntityManager,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAllDoctors(): Promise<User[]> {
    return this.userRepository.find({
      where: { role: UserRole.DOCTOR },
      select: ['id', 'fullName', 'email', 'departmentId', 'createdAt'],
    });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      select: ['id', 'fullName', 'email', 'role', 'departmentId', 'createdAt'],
    });
  }

  async updateProfile(id: string, updateData: UpdateProfileDto): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User profile not found.');
    }

    if (updateData.email && updateData.email !== user.email) {
      const existing = await this.findOneByEmail(updateData.email);
      if (existing) {
        throw new ConflictException('Email address is already in use by another user.');
      }
      user.email = updateData.email;
    }

    if (updateData.fullName) {
      user.fullName = updateData.fullName;
    }

    if (updateData.password) {
      user.password = await bcrypt.hash(updateData.password, 10);
    }

    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.createQueryBuilder()
        .delete()
        .from('appointments')
        .where('patientId = :id OR doctorId = :id', { id })
        .execute();

      const result = await transactionalEntityManager.delete(User, id);
      if (result.affected === 0) {
        throw new NotFoundException('User to delete not found.');
      }
    });
  }

  async makeAdmin(id: string): Promise<User> {
    const user = await this.findOneById(id);
    if (!user) {
      throw new NotFoundException('User to elevate not found.');
    }
    user.role = UserRole.ADMIN;
    return this.userRepository.save(user);
  }
}
