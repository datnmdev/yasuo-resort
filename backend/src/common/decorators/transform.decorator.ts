import { Transform } from 'class-transformer';

export function JsonToObject<T = any>(defaultValue?: T) {
  return Transform(({ value }) => {
    try {
      if (value === '') {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (error) {
      return value;
    }
  });
}
