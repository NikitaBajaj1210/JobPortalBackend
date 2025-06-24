import { MailerOptions } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class ConfigService {
  getTypeOrmConfig(): TypeOrmModuleOptions {
    return {
      type: process.env.DATABASE_TYPE as any,
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT, 10),
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [
        __dirname + '/../application/entities/application.entity{.ts,.js}',
        __dirname + '/../courses_and_certification/entities/courses_and_certification.entity{.ts,.js}',
        __dirname + '/../facebook/entities/facebook.entity{.ts,.js}',
        __dirname + '/../job-posting/entities/job-posting.entity{.ts,.js}',
        __dirname + '/../linkedIn/entities/linkedin.entity{.ts,.js}',
        __dirname + '/../notifications/entities/notification.entity{.ts,.js}',
        __dirname + '/../ranks/entities/rank.entity{.ts,.js}',
        __dirname + '/../training-type/entities/training-type.entity{.ts,.js}',
        __dirname + '/../travel_documents_type/entities/travel_documents_type.entity{.ts,.js}',
        __dirname + '/../uploads/entities/upload.entity{.ts,.js}',
        __dirname + '/../user/entities/user.entity{.ts,.js}',
        __dirname + '/../user-profile/entities/training-certificate.entity{.ts,.js}',
        __dirname + '/../user-profile/entities/travel-documents.entity{.ts,.js}',
        __dirname + '/../user-profile/entities/user-profile.entity{.ts,.js}',
        __dirname + '/../user-profile/entities/user_medical_questionnaire.entity{.ts,.js}',
      ],
      synchronize: false, // Set to false for production
      // synchronize: true,
      timezone: 'Z',
      autoLoadEntities: false,
      extra: {
        idleTimeoutMillis: 30000,
        poolSize: 25,
      },

      logger: 'simple-console',
      // logging:true,
    };
  }
}
