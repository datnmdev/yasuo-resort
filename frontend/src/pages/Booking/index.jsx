import { useState, useMemo, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { CheckCircle, XCircle, Users, Calendar as CalendarIcon, CircleDollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@ui/dialog';
import { useLocation, useNavigate } from 'react-router';
import { cn, formatCurrencyUSD, formatDateVN } from '@libs/utils';
import { useMutation, useQuery } from '@tanstack/react-query';
import bookingApi from '@apis/booking';
import { eachDayOfInterval, format } from 'date-fns';
import { Label } from '@ui/label';
import { Input } from '@ui/input';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { Spin } from 'antd';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Carousel, CarouselContent, CarouselItem } from '@ui/carousel';
import Cookies from 'js-cookie';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      navigate('/login');
    }
  }, [navigate]);

  const { room, startDate, endDate } = state || {};
  const defaultStartDate = startDate || dayjs().add(1, 'day').format('YYYY-MM-DD');

  const [dateRange, setDateRange] = useState([defaultStartDate, endDate]);
  const [guests, setGuests] = useState(1);

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
  const bookings = useMemo(() => bookingData?.data?.data[0] || [], [bookingData]);

  // Ktra ngày đấy của phòng có đã bị đặt chưa (dùng cho Calendar)
  const isDateBooked = (date) => {
    return getBookedDates(bookings).includes(format(date, 'yyyy-MM-dd'));
  };

  // Ktra khoảng thời gian check in checkout có dính ngày đã bị đặt ko.
  const hasConflictWithBookedDates = useCallback(
    (start, end) => {
      if (!start || !end) return false;

      const days = eachDayOfInterval({ start, end });
      return days.some((d) => getBookedDates(bookings).includes(format(d, 'yyyy-MM-dd')));
    },
    [bookings]
  );

  const [error, setError] = useState(
    hasConflictWithBookedDates(startDate, endDate)
      ? 'The selected date range includes a date that has already been booked.'
      : ''
  );
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBookingSuccessful, setIsBookingSuccessful] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const numberOfDays = useMemo(() => {
    if (dateRange[0] && dateRange[1]) {
      const start = new Date(dateRange[0]);
      const end = new Date(dateRange[1]);

      const diff = end.getTime() - start.getTime();
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1; // +1 để tính cả ngày cuối
      return days > 0 ? days : 0;
    }
    return 0;
  }, [dateRange]);

  const calculateRoomTotal = useMemo(() => {
    if (room && numberOfDays > 0) {
      return room.price * numberOfDays;
    }
    return 0;
  }, [room, numberOfDays]);

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
      capacity: guests,
    };

    bookingMutation.mutate(bookingData);
  };

  useEffect(() => {
    let newStart = dateRange[0] ? dayjs(dateRange[0], 'YYYY-MM-DD', true) : null;
    let newEnd = dateRange[1] ? dayjs(dateRange[1], 'YYYY-MM-DD', true) : null;

    if (newStart && newEnd && newStart.isValid() && newEnd.isValid())
      setError(
        hasConflictWithBookedDates(newStart.toDate(), newEnd.toDate())
          ? 'The selected date range includes a date that has already been booked.'
          : ''
      );
  }, [dateRange, hasConflictWithBookedDates]);

  //Carousel
  const [carouselApi, setCarouselApi] = useState();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const index = carouselApi.selectedScrollSnap();
      setCurrentImageIndex(index);
    };

    onSelect();
    carouselApi.on('select', onSelect);
    carouselApi.on('reInit', onSelect);

    // Auto slide every 3 seconds
    const interval = setInterval(() => {
      if (!carouselApi.canScrollNext()) {
        carouselApi.scrollTo(0); // Quay lại ảnh đầu nếu hết
      } else {
        carouselApi.scrollNext();
      }
    }, 5000);

    return () => {
      carouselApi.off('select', onSelect);
      carouselApi.off('reInit', onSelect);
      clearInterval(interval);
    };
  }, [carouselApi]);

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
                <Carousel setApi={setCarouselApi} opts={{ loop: true }} className="w-full h-44">
                  <CarouselContent>
                    {(room.media && room.media.length > 0 ? room.media : [{ path: 'placeholder.svg' }]).map(
                      (media, index) => (
                        <CarouselItem key={index} className="w-full h-44">
                          <img
                            src={`${baseUrl}/${media.path}`}
                            alt={room.type.name}
                            className="w-full h-44 object-cover rounded-lg shadow-md"
                            onError={(e) => {
                              e.target.onerror = null; // tránh loop vô hạn
                              e.target.src = '/placeholder.svg';
                            }}
                          />
                        </CarouselItem>
                      )
                    )}
                  </CarouselContent>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {(room.media && room.media.length > 0 ? room.media : [{ path: 'placeholder.svg' }]).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-2 w-2 rounded-full bg-white/75 transition-all',
                          i === currentImageIndex ? 'w-4' : 'bg-gray-300/75'
                        )}
                      />
                    ))}
                  </div>
                </Carousel>
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
                  <span className="font-semibold ml-7">{numberOfDays} days</span>
                </p>
                <p className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Capacity:</span> {room.maxPeople} Guests
                </p>
                <p className="flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Room price:</span> {formatCurrencyUSD(room.price)}
                </p>
              </div>
            </div>
            {/* Date Selection */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="guests" className="text-sm font-medium">
                    Number of people
                  </Label>
                  <Select value={guests} onValueChange={setGuests}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select number of guests" />
                    </SelectTrigger>
                    <SelectContent>
                      {[...Array(room.maxPeople).keys()]
                        .map((i) => i + 1)
                        .map((num) => (
                          <SelectItem key={num} value={num}>
                            {num} {num === 1 ? 'guest' : 'guests'}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="checkin" className="text-sm font-medium">
                    Check-in Date
                  </Label>
                  <Input
                    id="checkin"
                    type="date"
                    value={dateRange[0] || ''}
                    onChange={(e) => {
                      const newCheckin = e.target.value;
                      let newCheckout = dateRange[1];

                      if (
                        newCheckin &&
                        newCheckout &&
                        dayjs(newCheckin, 'YYYY-MM-DD').isAfter(dayjs(newCheckout, 'YYYY-MM-DD'))
                      ) {
                        // Nếu checkin > checkout thì set checkout = checkin
                        newCheckout = newCheckin;
                      }

                      setDateRange([newCheckin, newCheckout]);
                    }}
                    onBlur={(e) => {
                      let newStart = dayjs(e.target.value, 'YYYY-MM-DD', true);
                      const todayPlus1 = dayjs().add(1, 'day').startOf('day');

                      if (!newStart.isValid() || newStart.isBefore(todayPlus1)) {
                        newStart = todayPlus1;
                      }

                      setDateRange([newStart.format('YYYY-MM-DD'), dateRange[1]]);
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
                    value={dateRange[1] || ''}
                    onChange={(e) => setDateRange([dateRange[0], e.target.value])}
                    onBlur={(e) => {
                      const startStr = dateRange[0];
                      const endStr = e.target.value;

                      let newStart = dayjs(startStr, 'YYYY-MM-DD', true);
                      let newEnd = dayjs(endStr, 'YYYY-MM-DD', true);

                      // Nếu checkout không hợp lệ hoặc < checkin => set checkout = checkin
                      if (!newEnd.isValid() || newEnd.isBefore(newStart)) {
                        newEnd = newStart;
                      }

                      setDateRange([newStart.format('YYYY-MM-DD'), newEnd.format('YYYY-MM-DD')]);
                    }}
                    min={
                      dateRange[0]
                        ? dayjs(dateRange[0], 'YYYY-MM-DD').format('YYYY-MM-DD')
                        : dayjs().add(1, 'day').format('YYYY-MM-DD')
                    }
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>
            <h3 className="text-2xl font-bold text-teal-700 mb-1">
              {room.type.name} - Room {room.roomNumber}
            </h3>
            <p className="text-gray-600 text-sm">{room.shortDescription}</p>

            {/* Price Summary */}
            <div className="space-y-4">
              <div className="flex justify-between items-center text-gray-700">
                <span>Room Rate ({numberOfDays} days)</span>
                <span className="font-semibold">{formatCurrencyUSD(calculateRoomTotal)}</span>
              </div>
              <div className="flex justify-between items-center text-xl font-bold text-gray-900 pt-4 border-t-2 border-gray-200 mt-4">
                <span>Total Amount</span>
                <span className="text-teal-600">{formatCurrencyUSD(calculateRoomTotal)}</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button
                onClick={handleConfirmBooking}
                disabled={!(dateRange[0] && dateRange[1]) || error}
                className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-lg py-3"
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
              <CheckCircle className="w-16 h-16 text-teal-500 mx-auto mb-4" />
            ) : (
              <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            )}
            <DialogTitle className="text-2xl font-bold">
              {isBookingSuccessful ? 'Booking Confirmed!' : 'Booking Failed'}
            </DialogTitle>
            <DialogDescription className="text-gray-600">{bookingMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            {isBookingSuccessful ? (
              <>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    navigate('/services');
                    window.scrollTo(0, 0);
                  }}
                >
                  Go to Services
                </Button>
                <Button
                  className="bg-teal-600 hover:bg-teal-700"
                  onClick={() => {
                    navigate('/contracts');
                    window.scrollTo(0, 0);
                  }}
                >
                  Go to Contract
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowConfirmation(false)} className="bg-teal-600 hover:bg-teal-700">
                Try Again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
