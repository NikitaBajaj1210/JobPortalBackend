import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { UserProfileService } from './user-profile.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { TrainingCertificateDTO } from './dto/training-certificate.dto';
import { Response } from 'express';
import * as path from 'path';

@ApiTags('User Profile')
@Controller('user-profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  @Post('update-user-profile')
  @ApiOperation({ summary: 'Update user profile' })
  async create(@Body() createUserProfileDto: CreateUserProfileDto, @Req() req) {
    const user_id = req.user.id;
    return this.userProfileService.create(createUserProfileDto, user_id, req);
  }

  @Get('get-all')
  @ApiOperation({ summary: 'Retrieve all user profiles' })
  async findAll() {
    return this.userProfileService.findAll();
  }

  @Get('get-one')
  @ApiOperation({ summary: 'Retrieve a user profile by user ID' })
  @ApiQuery({
    name: 'id',
    required: true,
    type: String,
    description: 'The ID of the user profile',
  })
  async findOne(@Query('id') userId: string) {
    return this.userProfileService.findOne(userId);
  }

  @Get('export-by-UserId')
  async exportPdf(
    @Query('id') userId: string,
    @Res() res: Response,
  ): Promise<any> {
    try {
      // Step 1: Get the user profile using the userId (from the query string)
      const userProfile = await this.userProfileService.findOne(userId);

      if (!userProfile || userProfile.statusCode === 404) {
        return res.status(404).json({
          message: 'User profile not found.',
        });
      }
      // Step 2: Define the correct path to the EJS template based on the environment
      const templatePath = path.join(
        process.cwd(),
        'templates',
        'application-form.ejs',
      );

      console.log('Template Path:------------', templatePath); // For debugging purposes

      // Pass the user profile data to the template for dynamic rendering
      const pdf = await this.userProfileService.generatePdfFromTemplate(
        templatePath,
        userProfile.data,
      );

      // Step 3: Send the generated PDF as a response
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="application_form.pdf"',
      });
      res.send(pdf);
    } catch (error) {
      console.error('Error generating PDF:', error);
      return res.status(500).json({
        message: 'Error generating PDF.',
        error: error.message,
      });
    }
  }

  @Post(':id')
  @ApiOperation({ summary: 'Soft delete a user profile' })
  @ApiParam({ name: 'id', description: 'The ID of the user profile' })
  async remove(@Param('id') id: string) {
    return this.userProfileService.remove(id);
  }

  @Post('training-certificate-create-update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  createTrainingCertificate(
    @Body() trainingCertificateDTO: TrainingCertificateDTO,
  ) {
    return this.userProfileService.createTrainingCertificate(
      trainingCertificateDTO,
    );
  }
}
