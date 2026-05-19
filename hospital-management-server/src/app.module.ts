import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { DepartmentsModule } from './departments/departments.module.js';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'siyan',
      database: 'hmsDB',
      autoLoadEntities: true,
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    DepartmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}


