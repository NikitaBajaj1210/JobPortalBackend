import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { UserProfile } from './entities/user-profile.entity';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { WriteResponse } from 'src/shared/response';
import * as moment from 'moment';
import { TravelDocument } from './entities/travel-documents.entity';
import { TrainingCertificateDTO } from './dto/training-certificate.dto';
import { TrainingCertificate } from './entities/training-certificate.entity';
import { UserMedicalQuestion } from './entities/user_medical_questionnaire.entity';
import * as ejs from 'ejs';
import axios from 'axios';
import { Rank } from 'src/ranks/entities/rank.entity';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    @InjectRepository(TravelDocument)
    private readonly travelDocumentsRepository: Repository<TravelDocument>,
    @InjectRepository(TrainingCertificate)
    private readonly trainingCertificateRepo: Repository<TrainingCertificate>,
    @InjectRepository(UserMedicalQuestion)
    private readonly userMedicalQuestionRepo: Repository<UserMedicalQuestion>,
     @InjectRepository(Rank)
        private readonly rankRepo: Repository<Rank>,
  ) {}
  async create(
    createUserProfileDto: CreateUserProfileDto,
    user_id: string,
    req,
  ) {
    try {
      if (createUserProfileDto.legal_dependent.length > 4) {
        return WriteResponse(400, {}, 'Maximum 4 dependents are allowed.');
      }
      // Validate DOB format
      if (req.user.role !== 'admin') {
        if (
          !moment(createUserProfileDto.dob, moment.ISO_8601, true).isValid()
        ) {
          return WriteResponse(400, {}, 'Invalid datetime format for dob.');
        }
      }

      // Check age >= 18
      // const dobMoment = moment(createUserProfileDto.dob);
      // const age = moment().diff(dobMoment, 'years');
      // if (age < 18) {
      //   return WriteResponse(400, {}, 'User must be at least 18 years old.');
      // }

      const formattedDob = moment(createUserProfileDto.dob).toISOString();

      // Helper to stringify if value exists else null
      const toJson = (val: any) => (val ? JSON.stringify(val) : null);

      const profilePayload = {
        ...createUserProfileDto,
        dob: formattedDob,
        nationalities: toJson(createUserProfileDto.nationalities),
        additional_contact_info: toJson(
          createUserProfileDto.additional_contact_info,
        ),
        // work_experience_info: toJson(createUserProfileDto.work_experience_info),
        education_info: toJson(createUserProfileDto.education_info),
        // course_info: toJson(createUserProfileDto.course_info),
        // certification_info: toJson(createUserProfileDto.certification_info),
        career_info: toJson(createUserProfileDto.career_info),
        other_experience_info: toJson(
          createUserProfileDto.other_experience_info,
        ),
        project_info: toJson(createUserProfileDto.project_info),
        language_spoken_info: toJson(createUserProfileDto.language_spoken_info),
        contact_person_in_emergency: toJson(
          createUserProfileDto.contact_person_in_emergency,
        ),
        language_written_info: toJson(
          createUserProfileDto.language_written_info,
        ),
        legal_dependent: toJson(createUserProfileDto.legal_dependent),
        notice_period_info: toJson(createUserProfileDto.notice_period_info),
        current_salary_info: toJson(createUserProfileDto.current_salary_info),
        expected_salary_info: toJson(createUserProfileDto.expected_salary_info),
        preferences_info: toJson(createUserProfileDto.preferences_info),
        additional_info: toJson(createUserProfileDto.additional_info),
        vacancy_source_info: toJson(createUserProfileDto.vacancy_source_info),
        created_by: user_id,
        updated_by: user_id,
      };

      const newProfile = this.userProfileRepository.create(profilePayload);

      await this.userProfileRepository.update({ user_id }, newProfile);

      // First, find and remove the existing records from all repositories
      await this.travelDocumentsRepository.delete({ user_id });
      await this.trainingCertificateRepo.delete({ user_id });
      await this.userMedicalQuestionRepo.delete({ user_id });

      // Check if `travel_documents` is provided in DTO
      if (
        createUserProfileDto.travel_documents &&
        createUserProfileDto.travel_documents.length > 0
      ) {
        // Loop through each document and insert into the `travel_documents` table
        await Promise.all(
          createUserProfileDto.travel_documents.map(async (doc) => {
            if (!doc.travel_document_type_id) {
              throw new BadRequestException(
                `travel_document_type is required in travel_documents`,
              );
            }
            const travelDocumentPayload = {
              ...doc, // assuming `doc` contains the properties of the travel document
              user_id, // Link the travel document to the user's profile
              created_by: user_id,
              updated_by: user_id,
            };

            // Insert into `travel_documents` table
            await this.travelDocumentsRepository.save(travelDocumentPayload);
          }),
        );
      }

      // Check if `training_certificates` is provided in DTO
      if (
        createUserProfileDto.training_certificate &&
        createUserProfileDto.training_certificate.length > 0
      ) {
        // Loop through each certificate and insert into the `training_certificates` table
        await Promise.all(
          createUserProfileDto.training_certificate.map(async (certificate) => {
            // ✅ Validate training_type_id
            if (!certificate.training_type_id) {
              throw new BadRequestException(
                `training_type is required in training_certificate`,
              );
            }
            const trainingCertificatePayload = {
              ...certificate, // assuming `certificate` contains the properties of the training certificate
              user_id, // Link the training certificate to the user's profile
              created_by: user_id,
              updated_by: user_id,
            };

            // Insert into `training_certificates` table
            await this.trainingCertificateRepo.save(trainingCertificatePayload);
          }),
        );
      }
      // Check if `user_medical_questionnaire` is provided in DTO
      if (createUserProfileDto.user_medical_questionnaire) {
        const medicalQuestionnairePayload = {
          ...createUserProfileDto.user_medical_questionnaire,
          user_id, // Link the questionnaire to the user's profile
          created_by: user_id,
          updated_by: user_id,
        };

        // Insert into `user_medical_questionnaire` table
        await this.userMedicalQuestionRepo.save(medicalQuestionnairePayload);
      }

      return WriteResponse(
        200,
        createUserProfileDto,
        'User profile updated successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async findAll() {
    try {
      const profiles = await this.userProfileRepository.find({
        where: { is_deleted: false },
        order: { created_at: 'DESC' },
      });

      if (profiles.length === 0) {
        return WriteResponse(404, [], 'No user profiles found.');
      }

      return WriteResponse(
        200,
        profiles,
        'User profiles retrieved successfully.',
      );
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  // async findOne(userId: string) {
  //   try {
  //     const profile = await this.userProfileRepository.findOne({
  //       where: { user_id: userId, is_deleted: false },
  //       relations: ['user','rank','user.travel_documents','user.travel_documents.travel_documents_type'],
  //     });

  //     if (!profile) {
  //       return WriteResponse(
  //         404,
  //         {},
  //         `User Profile for the provided user ID not found.`,
  //       );
  //     }
  //     if (profile.user?.userProfile) {
  //       delete profile.user.userProfile;
  //       delete profile.user.password;
  //     }

  //     const userProfile = profile;

  //     // List all fields that need JSON parsing
  //     const jsonFields = [
  //       'nationalities',
  //       'additional_contact_info',
  //       'work_experience_info',
  //       'education_info',
  //       'course_info',
  //       'certification_info',
  //       'other_experience_info',
  //       'project_info',
  //       'language_spoken_info',
  //       'language_written_info',
  //       'notice_period_info',
  //       'current_salary_info',
  //       'expected_salary_info',
  //       'preferences_info',
  //       'additional_info',
  //       'vacancy_source_info',
  //     ];

  //     // Parse JSON fields safely
  //     for (const field of jsonFields) {
  //       if (userProfile[field] && typeof userProfile[field] === 'string') {
  //         try {
  //           userProfile[field] = JSON.parse(userProfile[field]);
  //         } catch {
  //           // If parsing fails, keep original or set to null/empty array as needed
  //           userProfile[field] = null; // or userProfile[field] = userProfile[field];
  //         }
  //       } else {
  //         userProfile[field] = null;
  //       }
  //     }

  //     return WriteResponse(
  //       200,
  //       profile,
  //       'User profile retrieved successfully.',
  //     );
  //   } catch (error) {
  //     console.log(error);
  //     return WriteResponse(
  //       500,
  //       {},
  //       error.message || 'An unexpected error occurred.',
  //     );
  //   }
  // }

  async findOne(userId: string) {
    try {
      const profile = await this.userProfileRepository.findOne({
        where: { user_id: userId, is_deleted: false },
        relations: [
          'user',
          'rank',
          'user.travel_documents',
          'user.travel_documents.travel_documents_type',
          'user.training_certificate',
          'user.training_certificate.training_type',
          'user.user_medical_questionnaire',
        ],
      });

      if (profile) {
        profile['travel_documents'] = profile.user.travel_documents.map(
          (item) => {
            return {
              id: item.id,
              // document_name: item.document_name,
              user_id: item.user_id,
              travel_document_type_id: item.travel_document_type_id,
              document_number: item.document_number,
              issue_place: item.issue_place,
              issue_date: item.issue_date,
              exp_date: item.exp_date,
              travel_documents_type: item.travel_documents_type?.name,
            };
          },
        );
        delete profile.user.travel_documents;
      }
      if (profile) {
        console.log('item-----------1------>>>>>>>>>');
        // Handle training_certificate transformation
        profile['training_certificate'] = profile.user.training_certificate.map(
          (item) => {
            console.log('item----------------->>>>>>>>>', item);
            return {
              id: item.id,
              // certificate_type: item.certificate_type,
              user_id: item.user_id,
              training_type_id: item.training_type_id,
              document_number: item.document_number,
              issue_date: item.issue_date,
              issue_place: item.issue_place,
              exp_date: item.exp_date,
              training_type: item.training_type?.name, // Similar to how travel_document_type is handled
            };
          },
        );
        delete profile.user.training_certificate; // Remove original training_certificate
      }

      if (profile) {
        console.log('item-----------2------>>>>>>>>>');

        // Handle userMedicalQuestion transformation
        if (
          profile.user.user_medical_questionnaire &&
          profile.user.user_medical_questionnaire.length > 0
        ) {
          profile['user_medical_questionnaire'] =
            profile.user.user_medical_questionnaire[0]; // Access the first item directly
        }

        // Optionally, delete the original array from profile if needed
        delete profile.user.user_medical_questionnaire;

        // Example of how to format the object (if needed)
        if (profile['user_medical_questionnaire']) {
          profile['user_medical_questionnaire'] = {
            id: profile['user_medical_questionnaire'].id,
            user_id: profile['user_medical_questionnaire'].user_id,
            accident_disability:
              profile['user_medical_questionnaire'].accident_disability,
            disease_unfit_service:
              profile['user_medical_questionnaire'].disease_unfit_service,
            psychiatric_treatment:
              profile['user_medical_questionnaire'].psychiatric_treatment,
            alcohol_drug_addiction:
              profile['user_medical_questionnaire'].alcohol_drug_addiction,
            blacklisted_illegal_activities:
              profile['user_medical_questionnaire']
                .blacklisted_illegal_activities,
            disease_unfit_service_reason:
              profile['user_medical_questionnaire']
                .disease_unfit_service_reason,
            blacklisted_illegal_activities_reason:
              profile['user_medical_questionnaire']
                .blacklisted_illegal_activities_reason,
          };
        }
      }

      if (!profile) {
        return WriteResponse(
          404,
          {},
          `User Profile for the provided user ID not found.`,
        );
      }
      if (profile.user?.userProfile) {
        delete profile.user.userProfile;
        delete profile.user.password;
      }

      const userProfile = profile;

      // List all fields that need JSON parsing
      const jsonFields = [
        'nationalities',
        'additional_contact_info',
        'work_experience_info',
        'education_info',
        'course_info',
        'career_info',
        'contact_person_in_emergency',
        'legal_dependent',
        'certification_info',
        'other_experience_info',
        'project_info',
        'language_spoken_info',
        'language_written_info',
        'notice_period_info',
        'current_salary_info',
        'expected_salary_info',
        'preferences_info',
        'additional_info',
        'vacancy_source_info',
      ];

      // Parse JSON fields safely
      for (const field of jsonFields) {
        if (userProfile[field] && typeof userProfile[field] === 'string') {
          try {
            userProfile[field] = JSON.parse(userProfile[field]);
          } catch {
            // If parsing fails, keep original or set to null/empty array as needed
            userProfile[field] = null; // or userProfile[field] = userProfile[field];
          }
        } else {
          userProfile[field] = null;
        }
      }
let parsedCareerInfo = [];

if (profile.career_info && profile.career_info.length > 0) {
  try {
    let rawCareerInfo = profile.career_info;

    if (typeof rawCareerInfo === 'string') {
      rawCareerInfo = JSON.parse(rawCareerInfo);
    }

    if (Array.isArray(rawCareerInfo)) {
      const rankIds = rawCareerInfo.map(ci => ci.rank_id).filter(Boolean);
      console.log('Extracted rankIds:', rankIds);

      if (rankIds.length > 0) {
        const ranks = await this.rankRepo.find({ where: { id: In(rankIds) } });
        const rankMap = new Map(ranks.map(r => [r.id, r.rank_name]));
        console.log('Rank Map:', rankMap);

        parsedCareerInfo = rawCareerInfo.map(ci => ({
          ...ci,
          rank_name: rankMap.get(ci.rank_id) || null,
        }));
      } else {
        parsedCareerInfo = rawCareerInfo;
      }
    } else {
      console.warn('career_info is not an array:', rawCareerInfo);
    }
  } catch (err) {
    console.error('Error parsing career_info:', err.message);
    parsedCareerInfo = [];
  }
} else {
  console.warn('career_info is missing or empty');
}

(profile as any).career_info_parsed = parsedCareerInfo;





      // 2. Attach parsed and enriched info separately for response
      (profile as any).career_info_parsed = parsedCareerInfo;

      return WriteResponse(
        200,
        profile,
        'User profile retrieved successfully.',
      );
    } catch (error) {
      console.log(error);
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async generatePdfFromTemplate(
    templatePath: string,
    data: any,
  ): Promise<Buffer> {
    try {
      // Step 1: Render the EJS template with dynamic data
      const htmlContent: string = await ejs.renderFile(templatePath, data);

      // Step 2: Send HTML to remote PDF generation API
      const response = await axios.post(
        'https://ezpz.microlent.com/api2/generate-pdf',
        {
          html: htmlContent,
          fileName: 'test.pdf',
        },
        {
          responseType: 'arraybuffer', // Needed to receive binary buffer
          timeout: 10000, // Set timeout to 10 seconds
        },
      );

      // Step 3: Convert to Buffer and return
      const buffer = Buffer.from(response.data);

      return buffer;
    } catch (error) {
      throw new Error('Error generating PDF from template: ' + error.message);
    }
  }

  async remove(id: string) {
    try {
      const profile = await this.findOne(id);
      if (profile.statusCode === 404) {
        return profile;
      }

      profile.data.is_deleted = true;

      await this.userProfileRepository.save(profile.data);

      return WriteResponse(200, {}, 'User profile deleted successfully.');
    } catch (error) {
      return WriteResponse(
        500,
        {},
        error.message || 'An unexpected error occurred.',
      );
    }
  }

  async createTrainingCertificate(
    trainingCertificateDTO: TrainingCertificateDTO,
  ) {
    try {
      if (trainingCertificateDTO.id) {
        await this.trainingCertificateRepo.update(
          trainingCertificateDTO.id,
          trainingCertificateDTO,
        );
        return WriteResponse(
          200,
          trainingCertificateDTO,
          'Training Certificate updated successfully.',
        );
      } else {
        if (trainingCertificateDTO.id === null) {
          delete trainingCertificateDTO.id;
        }
        const trainingType = await this.trainingCertificateRepo.save(
          trainingCertificateDTO,
        );
        return WriteResponse(
          200,
          trainingType,
          'Training Certificate created successfully.',
        );
      }
    } catch (error) {
      console.error(error);
      return WriteResponse(500, false, 'Internal Server Error');
    }
  }
}
