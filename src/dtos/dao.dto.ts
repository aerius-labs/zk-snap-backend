import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

export class CreateDaoDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(1, 200)
  description: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsArray()
  @ArrayNotEmpty()
  members: string[];
}

export class UpdateDaoDto {
  @IsOptional()
  @IsString()
  @MaxLength(50, {
    message: 'Name should not be greater than 50 characters',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200, {
    message: 'Description should not be greater than 200 characters',
  })
  description?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({
    message: 'Members should be a non-empty array',
  })
  members?: string[];
}
