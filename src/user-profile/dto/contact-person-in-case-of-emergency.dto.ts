import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, Matches } from "class-validator";

export class ContactPersonDTO {
  @ApiProperty()
  name?: string;

  @ApiProperty()
  address?: string;

@ApiProperty({ example: '+911234567890' })
  @IsOptional()
  @IsString({ message: 'Contact number must be a string.' })
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Contact number must be a valid phone number with 10 to 15 digits.',
  })
  contact_number?: string;

  @ApiProperty()
  relationship?: string;
}