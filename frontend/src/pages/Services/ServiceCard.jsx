import { Star, Gift, Sparkles, Users, Calendar, Heart } from 'lucide-react';
import { useCart } from '@src/hooks/useCart';
import { formatCurrencyUSD } from '@src/libs/utils';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import { useEffect, useState } from 'react';
import { Button } from '@ui/button';
import { v4 as uuidv4 } from 'uuid';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import userApi from '@apis/user';

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
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');
  const [isAddDisabled, setIsAddDisabled] = useState(true);

  const [selectedFavoriteService, setSelectedFavoriteService] = useState(null);

  const handleAddToCart = () => {
    if (Object.keys(booking).length === 0) {
      toast.info('Please select a room before adding services');
      return;
    }
    setIsBooking(true);
  };
  const onHandleSelectFavoriteservice = async (selectedFavoriteService) => {
    try {
      await userApi.createFavoriteService({ serviceId: selectedFavoriteService });
      toast.success('Added to favorite services');
    } catch (err) {
      console.error('Create favorite failed', err);
      toast.error('Service had been added to favorites');
    }
  }

  useEffect(() => {
    const start = dayjs(tempStartDate, 'YYYY-MM-DD', true);
    const end = dayjs(tempEndDate, 'YYYY-MM-DD', true);
    const minStart = dayjs(startDate);
    const maxEnd = dayjs(endDate);

    const isValidDate =
      start.isValid() && end.isValid() && !start.isBefore(minStart) && !end.isAfter(maxEnd) && !start.isAfter(end);

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
            <div className='flex justify-center align-center'>
              <Button
                title="Add to favorite"
                size="xl"
                className="mt-2 px-4 py-1.5 bg-red-300 hover:bg-red-400 text-white rounded-lg text-sm mr-2"
                onClick={async () => {
                  console.log('Selected favorite service ID:', id);
                  setSelectedFavoriteService(id);
                  onHandleSelectFavoriteservice(id);
                }}
              >
                <Heart className="w-4 h-4 inline-block" />
              </Button>
              <Button

                onClick={handleAddToCart}
                className="mt-2 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
              >
                + Add to cart
              </Button>

            </div>

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
                max={booking.capacity}
                value={tempNumPeople}
                onChange={(e) => {
                  let value = Number(e.target.value);

                  // Ép giá trị nằm trong khoảng [1, booking.capacity]
                  if (value < 1) value = 1;
                  if (value > booking.capacity) value = booking.capacity;

                  setTempNumPeople(value);
                }}
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

                  // Nếu start > end => set end = start
                  if (tempEndDate && tempStart.isAfter(dayjs(tempEndDate))) {
                    // Nếu start > max end => set start = max end
                    if (tempStart.isAfter(dayjs(endDate))) {
                      tempStart = dayjs(endDate);
                    }
                    setTempEndDate(tempStart.format('YYYY-MM-DD'));
                  }

                  setTempStartDate(tempStart.format('YYYY-MM-DD'));
                }}
                min={dayjs().isAfter(dayjs(startDate)) ? dayjs().format('YYYY-MM-DD') : startDate}
                max={dayjs(endDate).format('YYYY-MM-DD')}
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
                  const minEndDate = dayjs(tempStartDate);

                  // Nếu ngày nhập không hợp lệ hoặc nhỏ hơn minEndDate thì gán lại bằng minEndDate
                  if (!tempEnd.isValid() || tempEnd.isBefore(minEndDate, 'day')) {
                    tempEnd = minEndDate;
                  }

                  setTempEndDate(tempEnd.format('YYYY-MM-DD'));
                }}
                min={dayjs(tempStartDate).format('YYYY-MM-DD')}
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
