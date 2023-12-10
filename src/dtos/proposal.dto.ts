import { Transform, Type } from 'class-transformer';
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
export class createProposalDto {
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
  @Type(() => Date)
  start_time: Date;

  @IsNotEmpty()
  @Type(() => Date)
  end_time: Date;

  // @IsNotEmpty()
  // @IsArray()
  // @ArrayNotEmpty()
  // @ArrayUnique()
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
  @Type(() => Date)
  start_time: Date;

  @IsNotEmpty()
  @Type(() => Date)
  end_time: Date;

  @IsArray()
  @ArrayUnique()
  @Transform(
    ({ value }) => {
      Array.isArray(value) && value.length === 0 ? ['Yes', 'No'] : value;
    },
    { toClassOnly: true },
  )
  voting_options: string[];
}
