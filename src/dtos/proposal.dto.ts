import { Transform } from 'class-transformer';
import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsDate,
  IsNotEmpty,
  IsString,
  Max,
  ValidateIf,
} from 'class-validator';
export class createdProposalDto {
  @IsNotEmpty()
  @IsString()
  creator: string;

  @IsString()
  @ValidateIf((o) => o.title && o.title.length <= 100, {
    message: 'Title should not be empty and not greater than 100 characters',
  })
  title: string;

  @IsString()
  @ValidateIf((o) => o.description && o.description.length <= 500, {
    message:
      'Description should not be empty and not greater than 500 characters',
  })
  description: string;

  @IsNotEmpty()
  @IsString()
  dao_id: string;

  @IsNotEmpty()
  @IsDate()
  start_time: Date;

  @IsNotEmpty()
  @IsDate()
  end_time: Date;

  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Transform(({ value }) => value || ['Yes', 'No'], { toClassOnly: true })
  voting_options: string[];
}
export class UpdateProposalDto {
  @IsString()
  @ValidateIf((o) => o.title && o.title.length <= 100, {
    message: 'Title should not be empty and not greater than 100 characters',
  })
  title: string;

  @IsString()
  @ValidateIf((o) => o.description && o.description.length <= 500, {
    message:
      'Description should not be empty and not greater than 500 characters',
  })
  description: string;

  @IsNotEmpty()
  @IsDate()
  start_time: Date;

  @IsNotEmpty()
  @IsDate()
  end_time: Date;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @Transform(({ value }) => value || ['Yes', 'No'], { toClassOnly: true })
  voting_options: string[];
}
