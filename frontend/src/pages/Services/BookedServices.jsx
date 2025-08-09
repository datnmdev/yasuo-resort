import { cn, formatCurrencyUSD, formatDateVN } from '@libs/utils';
import { useCart } from '@src/hooks/useCart';
import { Badge } from '@ui/badge';
import { Card, CardContent } from '@ui/card';

export default function BookedServices() {
  const { booking } = useCart();
  const { room, bookingServices } = booking;
  const getNumberOfDays = (start, end) => {
    const diff = new Date(end) - new Date(start);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const filteredServices = (bookingServices ?? []).filter((service) => service.status !== 'rejected');
  if (!filteredServices || filteredServices.length === 0) return null;

  return (
    <Card className="shadow-md">
      <CardContent className="p-4 space-y-3">
        <div className="font-semibold text-lg">
          Services for {room?.type?.name} Room ({room?.roomNumber})
        </div>
        <div className="text-sm text-muted-foreground mb-2">Services already ordered for this room.</div>

        {filteredServices.map((bs) => {
          const s = bs.service;
          const totalDays = getNumberOfDays(bs.startDate, bs.endDate);
          const total = parseFloat(s.price) * bs.quantity * totalDays;

          return (
            <div key={bs.id} className="flex justify-between items-start border-b border-gray-300 last:border-0 pb-2">
              <div className="flex items-start">
                <div>
                  <div className="flex items-center gap-1">
                    {s.name} ({bs.quantity} {bs.quantity > 1 ? 'people' : 'person'})
                    <Badge
                      className={cn(
                        bs.status === 'pending'
                          ? 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                          : 'bg-green-100 hover:bg-green-200 text-green-800'
                      )}
                    >
                      {bs.status === 'pending' ? 'Pending' : 'Confirmed'}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    from {formatDateVN(bs.startDate)} to {formatDateVN(bs.endDate)}
                  </div>
                </div>
              </div>
              <div className="text-right font-medium">{formatCurrencyUSD(total)}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
