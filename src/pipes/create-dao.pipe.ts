import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

interface ValidationPipeOptions {
  transform?: boolean;
}

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  constructor(private options?: ValidationPipeOptions) {}
  async transform(value: any, { metatype }: ArgumentMetadata) {
    console.log('Entering ValidationPipe.transform with value:', value);
    console.log('Current ValidationPipe options:', this.options);
  
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
  
    const object = plainToClass(metatype, value);
    

    console.log('object created before error check', object);
  
    const errors = await validate(object);
  
  
    if (errors.length > 0) {
      const messages = errors.flatMap((error) =>
        Object.values(error.constraints || {}),
      );
      throw new BadRequestException(messages);
    }
  

    console.log('transform', this.options?.transform);
    if (this.options?.transform) {
      console.log('object after transform', object);
      return object;
    }
  
    return value;
  }
  

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
