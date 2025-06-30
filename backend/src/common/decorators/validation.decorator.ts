import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function OneOf(
  validValues: any[],
  validationOptions?: ValidationOptions
): PropertyDecorator {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [validValues],
      validator: {
        validate(value: any, args: ValidationArguments): boolean {
          const [relatedValues] = args.constraints;
          return relatedValues && Array.isArray(relatedValues)
            ? relatedValues.includes(value)
            : false;
        },
        defaultMessage(args: ValidationArguments): string {
          const [relatedValues] = args.constraints;
          return `${args.property} must match one of the following values: ${relatedValues.join(', ')}`;
        },
      },
    });
  };
}

export function ArrayElementsIn(
  referenceArray: any[],
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [referenceArray],
      validator: {
        validate(value: any[], args: ValidationArguments) {
          const [referenceArray] = args.constraints;
          if (!Array.isArray(value)) {
            return false;
          }
          return value.every((element) => referenceArray.includes(element));
        },
        defaultMessage(args: ValidationArguments) {
          const [referenceArray] = args.constraints;
          return `All elements in ${args.property} must exist in [${referenceArray.join(
            ', '
          )}]`;
        },
      },
    });
  };
}

export function IsOrderBy(
  referenceArray: string[],
  validationOptions?: ValidationOptions
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'IsOrderBy',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [referenceArray],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const referenceArray: string[] = args.constraints[0];
          if (!Array.isArray(value)) {
            return false;
          }
          if (value.some((el) => !Array.isArray(el) || el.length != 2)) {
            return false;
          }
          if (!value.every((el) => ['ASC', 'DESC'].includes(el[1]))) {
            return false;
          }
          if (!value.every((el) => referenceArray.includes(el[0]))) {
            return false;
          }
          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const [referenceArray] = args.constraints;
          return [
            `Value for "${args.property}" must be an array of ["field", "ASC" | "DESC"].`,
            `Valid fields: [${referenceArray.join(', ')}].`,
          ].join(' ');
        },
      },
    });
  };
}
