import { formatCurrencyVND, formatDateVN } from '@libs/utils';
import { useCart } from '@src/hooks/useCart';
import { Card, CardContent } from '@ui/card';

export default function BookedServices() {
  const { booking } = useCart();
  const { room, bookingServices } = booking;
  const getNumberOfDays = (start, end) => {
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (!bookingServices || bookingServices.length === 0) return null;

  return (
    <Card className="shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="font-semibold text-lg">
          Services for {room?.type?.name} Room ({room?.roomNumber})
        </div>
        <div className="text-sm text-muted-foreground mb-2">Services already ordered for this room.</div>

        {bookingServices.map((bs) => {
          const s = bs.service;
          const totalDays = getNumberOfDays(bs.startDate, bs.endDate);
          const total = parseFloat(s.price) * bs.quantity * totalDays;

          return (
            <div key={bs.id} className="flex justify-between items-start border-b border-gray-300 last:border-0 pb-2">
              <div className="flex items-start">
                <div>
                  <div>
                    {s.name} ({bs.quantity} {bs.quantity > 1 ? 'people' : 'person'})
                  </div>
                  <div className="text-sm text-gray-500">
                    from {formatDateVN(bs.startDate)} to {formatDateVN(bs.endDate)}
                  </div>
                </div>
              </div>
              <div className="text-right font-medium">{formatCurrencyVND(total)}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
