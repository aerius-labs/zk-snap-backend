import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateDaoDto {
  @IsString()
  @Length(3, 50)
  name: string;

  @IsString()
  @Length(10, 200)
  description: string;

  @IsOptional()
  @IsString()
  @IsUrl(undefined, { message: 'DAO logo URL is not valid.' })
  logo?: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayNotEmpty({
    message: 'Members should be a non-empty array',
  })
  members: string[];
}

export class UpdateDaoDto {
  @IsOptional()
  @IsString()
  @MinLength(3, {
    message: 'Name should not be less than 3 characters',
  })
  @MaxLength(50, {
    message: 'Name should not be greater than 50 characters',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(10, {
    message: 'Description should not be less than 10 characters',
  })
  @MaxLength(200, {
    message: 'Description should not be greater than 200 characters',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @IsUrl(undefined, { message: 'DAO logo URL is not valid.' })
  logo?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty({
    message: 'Members should be a non-empty array',
  })
  members?: string[];
}
