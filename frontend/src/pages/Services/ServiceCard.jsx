import { Star, Gift, Sparkles, Users, Calendar } from 'lucide-react';
import { useCart } from '@src/hooks/useCart';
import { formatCurrencyUSD } from '@src/libs/utils';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@ui/button';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

const iconMap = [
  <Gift key={0} className="w-5 h-5 text-teal-600" />,
  <Star key={1} className="w-5 h-5 text-teal-600" />,
  <Sparkles key={2} className="w-5 h-5 text-teal-600" />,
];

export default function ServiceCard({ service }) {
  const { id, name, description, price } = service;
  const { booking, add } = useCart();
  const { startDate, endDate } = booking;

  const [isBooking, setIsBooking] = useState(false);
  const [tempNumPeople, setTempNumPeople] = useState(1);
  const [tempStartDate, setTempStartDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [tempEndDate, setTempEndDate] = useState('');
  const [isAddDisabled, setIsAddDisabled] = useState(true);

  const handleAddToCart = () => {
    if (Object.keys(booking).length === 0) {
      alert('Please select a room before adding services');
      return;
    }
    setIsBooking(true);
  };

  useEffect(() => {
    // Xử lý tempStartDate
    if (!startDate || dayjs(startDate).isBefore(dayjs(), 'day')) {
      setTempStartDate(dayjs().format('YYYY-MM-DD'));
    } else {
      setTempStartDate(startDate);
    }

    // Xử lý tempEndDate
    if (!endDate) {
      setTempEndDate('');
    } else {
      // Nếu endDate nhỏ hơn tempStartDate + 1 ngày, thì gán endDate thành tempStartDate + 1 ngày
      const minEndDate = dayjs(startDate).add(1, 'day');
      const givenEndDate = dayjs(endDate);

      if (!givenEndDate.isValid() || givenEndDate.isBefore(minEndDate, 'day')) {
        setTempEndDate(minEndDate.format('YYYY-MM-DD'));
      } else {
        setTempEndDate(endDate);
      }
    }
  }, [startDate, endDate]);

  useEffect(() => {
    const start = dayjs(tempStartDate, 'YYYY-MM-DD', true);
    const end = dayjs(tempEndDate, 'YYYY-MM-DD', true);
    const minStart = dayjs(startDate);
    const maxEnd = dayjs(endDate);

    const isValidDate =
      start.isValid() &&
      end.isValid() &&
      !start.isBefore(minStart) &&
      !end.isAfter(maxEnd) &&
      !start.isAfter(end.subtract(1, 'day'));

    const isValidNumPeople = tempNumPeople && tempNumPeople > 0;

    setIsAddDisabled(!(isValidDate && isValidNumPeople));
  }, [tempStartDate, tempEndDate, tempNumPeople, startDate, endDate]);

  return (
    <div className="bg-white/90 border border-gray-300 rounded-lg p-4 hover:shadow-md transition">
      <div className="flex justify-between items-center">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <div className="p-2 bg-teal-100 rounded-lg">{iconMap[id % 3]}</div>
            <span>{name}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: description }} />
        </div>
        <div className="text-right">
          <p className="font-bold text-teal-700 text-lg">{formatCurrencyUSD(price)}/person/day</p>
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
                max={booking.room.maxPeople}
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
                onBlur={(e) => {
                  const bookingStart = dayjs(startDate);
                  const today = dayjs().startOf('day');
                  const minStart = today.isAfter(bookingStart) ? today : bookingStart; // mốc min thực tế

                  let tempStart = dayjs(e.target.value);

                  // Nếu ngày nhập không hợp lệ hoặc nhỏ hơn mốc min => set bằng mốc min
                  if (!tempStart.isValid() || tempStart.isBefore(minStart)) {
                    tempStart = minStart;
                  }

                  // Nếu start > end => set start = end - 1 ngày (nhưng không nhỏ hơn mốc min)
                  if (tempEndDate && tempStart.isSameOrAfter(dayjs(tempEndDate))) {
                    const newStart = dayjs(tempEndDate).subtract(1, 'day');
                    tempStart = newStart.isBefore(minStart) ? minStart : newStart;
                  }

                  setTempStartDate(tempStart.format('YYYY-MM-DD'));
                }}
                min={dayjs().isAfter(dayjs(startDate)) ? dayjs().format('YYYY-MM-DD') : startDate}
                max={dayjs(tempEndDate).subtract(1, 'day').format('YYYY-MM-DD')}
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
                onBlur={(e) => {
                  let tempEnd = dayjs(e.target.value);
                  const minEndDate = dayjs(tempStartDate).add(1, 'day');

                  // Nếu ngày nhập không hợp lệ hoặc nhỏ hơn minEndDate thì gán lại minEndDate
                  if (!tempEnd.isValid() || tempEnd.isBefore(minEndDate, 'day')) {
                    tempEnd = minEndDate;
                  }

                  setTempEndDate(tempEnd.format('YYYY-MM-DD'));
                }}
                min={dayjs(tempStartDate).add(1, 'day').format('YYYY-MM-DD')}
                max={endDate}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              disabled={isAddDisabled}
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
