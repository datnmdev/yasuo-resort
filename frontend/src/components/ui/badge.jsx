import { cva } from 'class-variance-authority';
import { cn } from '@libs/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-black text-white hover:bg-neutral-800 border-transparent',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 border-transparent',
        destructive: 'bg-red-500 text-white hover:bg-red-600 border-transparent',
        outline: 'border border-gray-300 text-gray-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

// eslint-disable-next-line react-refresh/only-export-components
export { Badge, badgeVariants };
