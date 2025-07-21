import { formatCurrencyVND, formatDateVN } from '@libs/utils';
import { useCart } from '@src/hooks/useCart';
import { Button } from '@ui/button';
import { X } from 'lucide-react';

export default function CartItems({ service }) {
  const { remove } = useCart();

  const itemTotal = service.price * (service.numberOfPeople || 1);

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
      <div className="flex-grow">
        <p className="font-medium text-gray-800">{service.name}</p>
        <p className="text-sm text-gray-600">{service.quantity} person(s)</p>
        <p className="text-sm text-gray-600">{`from ${formatDateVN(service.startDate)} to ${formatDateVN(
          service.endDate
        )}`}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800">{formatCurrencyVND(itemTotal)}</span>
        <Button size="icon" onClick={() => remove(service.uuid)} className="w-8 h-8 text-red-500 hover:bg-red-50">
          <X className="w-4 h-4" />
          <span className="sr-only">Remove</span>
        </Button>
      </div>
    </div>
  );
}
