import {
  ArrayNotEmpty,
  IsArray,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateDaoDto {
  @IsString()
  @Length(1, 50)
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
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsString()
  logo: string;

  @IsArray()
  @ArrayNotEmpty()
  members: string[];
}
