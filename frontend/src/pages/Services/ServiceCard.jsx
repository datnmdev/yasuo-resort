import { Star, Gift, Sparkles, Users, Calendar } from 'lucide-react';
import { useCart } from '@src/hooks/useCart';
import { formatCurrencyVND } from '@src/libs/utils';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { useState } from 'react';
import { Button } from '@ui/button';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';

const iconMap = [
  <Gift key={0} className="w-5 h-5 text-teal-600" />,
  <Star key={1} className="w-5 h-5 text-teal-600" />,
  <Sparkles key={2} className="w-5 h-5 text-teal-600" />,
];

export default function ServiceCard({ service }) {
  const { id, name, description, price } = service;
  const { booking, add } = useCart();
  const { startDate, endDate } = booking;

  // State for in-card configuration
  const [isBooking, setIsBooking] = useState(false);
  const [tempNumPeople, setTempNumPeople] = useState(1);
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  const handleAddToCart = () => {
    if (Object.keys(booking).length === 0) {
      alert('Please select a room before adding services');
      return;
    }
    setIsBooking(true);
  };

  return (
    <div className="bg-white/90 border border-gray-300 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="p-2 bg-teal-100 rounded-lg">{iconMap[id % 3]}</div>
            <span>{name}</span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-teal-700 text-lg">{formatCurrencyVND(price)}/person/day</p>
          {!isBooking && (
            <Button
              size="sm"
              onClick={handleAddToCart}
              className="mt-2 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
            >
              + Add to cart
            </Button>
          )}
        </div>
      </div>
      {isBooking && (
        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor={`num-people-${service.id}`} className="text-sm text-gray-700 flex items-center">
                <Users className="inline-block w-4 h-4 mr-1" /> People
              </Label>
              <Input
                id={`num-people-${service.id}`}
                type="number"
                min="1"
                value={tempNumPeople}
                onChange={(e) => setTempNumPeople(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`start-date-${service.id}`} className="text-sm text-gray-700 flex items-center">
                <Calendar className="inline-block w-4 h-4 mr-1" /> Start Date
              </Label>
              <Input
                id={`start-date-${service.id}`}
                type="date"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                min={startDate}
                max={endDate}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`end-date-${service.id}`} className="text-sm text-gray-700 flex items-center">
                <Calendar className="inline-block w-4 h-4 mr-1" /> End Date
              </Label>
              <Input
                id={`end-date-${service.id}`}
                type="date"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                min={dayjs(tempStartDate || startDate)
                  .add(1, 'day')
                  .format('YYYY-MM-DD')}
                max={endDate}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              className="flex-grow bg-teal-700 hover:bg-teal-800"
              onClick={() => {
                setIsBooking(false);
                add({
                  ...service,
                  quantity: tempNumPeople,
                  startDate: tempStartDate,
                  endDate: tempEndDate,
                  uuid: uuidv4(),
                });
              }}
              disabled={!tempNumPeople || tempNumPeople <= 0 || !tempStartDate || !tempEndDate}
            >
              Confirm Add
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsBooking(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
