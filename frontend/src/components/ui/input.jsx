import { forwardRef } from 'react';
import { cn } from '../../libs/utils';

const Input = forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        'h-10 w-full rounded-md border border-gray-300 placeholder:text-base bg-white px-3 py-2 text-base ring-offset-white placeholder:text-teal-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        className
      )}
      ref={ref}
      {...props}
    />
  );
});

Input.displayName = 'Input';

export { Input };
