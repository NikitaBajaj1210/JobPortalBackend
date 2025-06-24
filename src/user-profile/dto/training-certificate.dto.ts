import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class TrainingCertificateDTO {

  id?: string;
  
  @ApiProperty()
   @IsNotEmpty({ message: 'training_type is required' })
  training_type_id?: string;

    @ApiProperty()
  user_id?: string;


  @ApiProperty()
  certificate_type?: string;

  @ApiProperty()
  document_number?: string;

  @ApiProperty()
  issue_place?: string;

  @ApiProperty()
  issue_date?: Date;

  @ApiProperty()
  exp_date?: Date;
}