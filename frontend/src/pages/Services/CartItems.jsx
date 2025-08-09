import { formatCurrencyUSD, formatDateVN } from '@libs/utils';
import { useCart } from '@src/hooks/useCart';
import { Button } from '@ui/button';
import { X } from 'lucide-react';

export default function CartItems({ service }) {
  const { remove } = useCart();
  const msPerDay = 1000 * 60 * 60 * 24;
  const start = new Date(service.startDate);
  const end = new Date(service.endDate);

  // Tính số ngày bao gồm cả ngày cuối
  const numberOfDays = Math.max(1, Math.ceil((end - start) / msPerDay) + 1);
  const itemTotal = service.price * (service.numberOfPeople || 1);

  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-300 last:border-b-0">
      <div className="flex-grow">
        <p className="font-medium text-gray-800">{service.name}</p>
        <p className="text-sm text-gray-600">
          {service.quantity} person(s) x {numberOfDays} day(s)
        </p>
        <p className="text-sm text-gray-600">{`from ${formatDateVN(service.startDate)} to ${formatDateVN(
          service.endDate
        )}`}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-semibold text-gray-800">{formatCurrencyUSD(itemTotal)}</span>
        <Button size="icon" onClick={() => remove(service.uuid)} className="w-8 h-8 text-red-500 hover:bg-red-50">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
