import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value, {
      exposeDefaultValues: true,
    });
    const errors = await validate(object);
    if (errors.length > 0) {
      const constraints = errors
        .map((error) => error.constraints)
        .reduce((prevValue, currValue) => {
          const newValue = [...prevValue];
          for (const key in currValue) {
            newValue.push(currValue[key]);
          }
          return newValue;
        }, []);
      throw new BadRequestException(constraints);
    }
    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
