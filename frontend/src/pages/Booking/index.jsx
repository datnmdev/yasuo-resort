import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { CheckCircle, XCircle, Users, Calendar as CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@ui/dialog';
import { useLocation, useNavigate } from 'react-router';
import { formatCurrencyUSD, formatDateVN } from '@libs/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import bookingApi from '@apis/booking';
import { eachDayOfInterval, format } from 'date-fns';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { Spin } from 'antd';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { room, startDate, endDate } = state;
  const [dateRange, setDateRange] = useState([startDate, endDate]);

  const { data: bookingData, isLoading } = useQuery({
    queryKey: ['bookings', room?.id],
    queryFn: () =>
      bookingApi.getBookings({
        page: 1,
        limit: 1000,
        roomId: room?.id,
        status: ['confirmed', 'pending'],
      }),
    keepPreviousData: true,
    enabled: !!room?.id,
  });

  const getBookedDates = (bookings) => {
    const bookedDates = bookings.flatMap((booking) => {
      const range = eachDayOfInterval({
        start: new Date(booking.startDate),
        end: new Date(booking.endDate),
      });

      return range.map((date) => format(date, 'yyyy-MM-dd'));
    });

    return [...new Set(bookedDates)];
  };
  const bookings = bookingData?.data?.data[0] || [];

  // Ktra ngày đấy của phòng có đã bị đặt chưa (dùng cho Calendar)
  const isDateBooked = (date) => {
    return getBookedDates(bookings).includes(format(date, 'yyyy-MM-dd'));
  };

  // Ktra khoảng thời gian check in checkout có dính ngày đã bị đặt ko.
  const hasConflictWithBookedDates = (start, end) => {
    if (!start || !end) return false;

    const days = eachDayOfInterval({ start, end });
    return days.some((d) => getBookedDates(bookings).includes(format(d, 'yyyy-MM-dd')));
  };

  const [error, setError] = useState(
    hasConflictWithBookedDates(startDate, endDate)
      ? 'The selected date range includes a date that has already been booked.'
      : ''
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBookingSuccessful, setIsBookingSuccessful] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const numberOfNights = useMemo(() => {
    if (dateRange[0] && dateRange[1]) {
      const start = new Date(dateRange[0]);
      const end = new Date(dateRange[1]);

      const diff = end.getTime() - start.getTime();
      const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  }, [dateRange]);

  const calculateRoomTotal = useMemo(() => {
    if (room && numberOfNights > 0) {
      return room.price * numberOfNights;
    }
    return 0;
  }, [room, numberOfNights]);

  const bookingMutation = useMutation({
    mutationFn: bookingApi.bookingRoom,
    onSuccess: (data) => {
      setIsBookingSuccessful(true);
      setShowConfirmation(true);
      setBookingMessage('Your room has been successfully booked. A confirmation will be sent to you soon.');
      console.log('Booking success:', data);
    },
    onError: (error) => {
      setIsBookingSuccessful(false);
      setShowConfirmation(true);
      setBookingMessage(error.response.data.error.message);
      console.error('Booking failed:', error);
    },
  });
  const handleConfirmBooking = () => {
    if (!room) {
      alert('No room selected for booking.');
      return;
    }

    const [checkin, checkout] = dateRange || [];

    const bookingData = {
      roomId: room.id,
      startDate: checkin ? format(checkin, 'yyyy-MM-dd') : null,
      endDate: checkout ? format(checkout, 'yyyy-MM-dd') : null,
    };

    console.log('Booking details:', bookingData);

    bookingMutation.mutate(bookingData);
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    if (isBookingSuccessful) {
      navigate('/');
      window.scrollTo(0, 0);
    }
  };

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="p-8 text-center">
          <CardTitle className="text-2xl font-bold text-red-600 mb-4">Room Not Found</CardTitle>
          <CardContent>
            <p className="text-gray-600 mb-6">
              The selected room could not be found. Please go back and select a room.
            </p>
            <Button onClick={() => navigate('/rooms')}>Go to Rooms Page</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 flex justify-center gap-8">
        <Card className="w-full max-w-3xl p-8 shadow-xl border border-gray-100">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-2xl font-bold text-gray-800">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8 mb-8">
              {/* Room Image and Basic Info */}
              <div>
                <img
                  src={`${baseUrl}/${room.media[0]?.path || 'placeholder.svg'}`}
                  alt={room.type.name}
                  className="w-full h-44 object-cover rounded-lg shadow-md"
                  onError={(e) => {
                    e.target.onerror = null; // tránh loop vô hạn
                    e.target.src = '/placeholder.svg';
                  }}
                />
              </div>
              {/* Dates and Capacity */}
              <div className="space-y-3 text-gray-700 text-base">
                <p className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Check-in:</span> {formatDateVN(dateRange[0])}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Check-out:</span> {formatDateVN(dateRange[1])}
                </p>
                <p className="flex items-center gap-2">
                  <span className="font-semibold ml-7">{numberOfNights} nights</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Capacity:</span> {room.maxPeople} Guests
                </p>
              </div>
            </div>
            {/* Date Selection */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="checkin" className="text-sm font-medium">
                    Check-in Date
                  </Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={dateRange?.[0] ? format(new Date(dateRange[0]), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const newStart = e.target.value ? new Date(e.target.value) : null;
                      const newEnd = dateRange?.[1] || null;

                      if (newStart && newEnd && hasConflictWithBookedDates(newStart, newEnd)) {
                        setError('The selected date range includes a date that has already been booked.');
                      } else {
                        setError('');
                      }

                      setDateRange([newStart, newEnd]);
                    }}
                    min={dayjs().add(1, 'day').format('YYYY-MM-DD')}
                  />
                </div>
                <div>
                  <Label htmlFor="checkout" className="text-sm font-medium">
                    Check-out Date
                  </Label>
                  <Input
                    id="checkout"
                    type="date"
                    value={dateRange?.[1] ? format(new Date(dateRange[1]), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      const newEnd = e.target.value ? new Date(e.target.value) : null;
                      const newStart = dateRange?.[0] || null;

                      if (newStart && newEnd && hasConflictWithBookedDates(newStart, newEnd)) {
                        setError('The selected date range includes a date that has already been booked.');
                      } else {
                        setError('');
                      }

                      setDateRange([newStart, newEnd]);
                    }}
                    min={
                      dateRange[0]
                        ? dayjs(dateRange[0]).add(1, 'day').format('YYYY-MM-DD')
                        : dayjs().format('YYYY-MM-DD')
                    }
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <h3 className="text-2xl font-bold text-green-700 mb-1">
              {room.type.name} - Room {room.roomNumber}
            </h3>
            <p className="text-gray-600 text-sm">{room.shortDescription}</p>

            {/* Price Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-700">
                <span>Room Rate ({numberOfNights} nights)</span>
                <span className="font-semibold">{formatCurrencyUSD(calculateRoomTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-4 border-t-2 border-gray-200 mt-4">
                <span>Total Amount</span>
                <span className="text-green-600">{formatCurrencyUSD(calculateRoomTotal)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleConfirmBooking}
                disabled={!(dateRange[0] && dateRange[1])}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white text-lg py-3"
              >
                Confirm Booking
              </Button>
              <Button
                variant="outline"
                className="flex-1 text-gray-700 text-lg py-3 bg-transparent"
                onClick={() => navigate('/rooms')}
              >
                Cancel Booking
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Right: Room Availability Calendar */}
        <div className="rounded-lg p-6 bg-white shadow-lg">
          <h2 className="text-xl font-semibold mb-4">📅 Room Availability</h2>
          <Spin spinning={isLoading} tip="Loading...">
            <Calendar
              locale="en-US"
              className="!border-0"
              selectRange
              tileClassName={({ date }) => {
                if (isDateBooked(date)) return '!bg-red-500 !text-white !cursor-not-allowed';
                return '!bg-white !text-gray-700';
              }}
            />
          </Spin>
          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border rounded-sm"></div>
              <span>Available</span>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="sm:max-w-[425px] text-center">
          <DialogHeader>
            {isBookingSuccessful ? (
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <DialogTitle className="text-2xl font-bold">
              {isBookingSuccessful ? 'Booking Confirmed!' : 'Booking Failed'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">{bookingMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-center">
            <Button onClick={handleCloseConfirmation} className="bg-green-600 hover:bg-green-700">
              {isBookingSuccessful ? 'Go to Home' : 'Try Again'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
