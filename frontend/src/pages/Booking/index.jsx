import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/card';
import { Button } from '@ui/button';
import { Separator } from '@ui/separator';
import { CheckCircle, XCircle, Calendar, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@ui/dialog';
import { useLocation, useNavigate } from 'react-router';
import { roomTypeSelector } from '@src/stores/reducers/roomTypeReducer';
import { useSelector } from 'react-redux';
import { Badge } from '@ui/badge';
import { serviceSelector } from '@src/stores/reducers/serviceReducer';
import { formatCurrencyUSD, formatDateVN } from '@libs/utils';
import { useMutation } from '@tanstack/react-query';
import bookingApi from '@apis/booking';

const baseUrl = import.meta.env.VITE_API_BASE_URL;

export default function BookingConfirmationPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { room, startDate, endDate } = state;
  const roomTypes = useSelector(roomTypeSelector.selectAll);
  const services = useSelector(serviceSelector.selectAll);

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isBookingSuccessful, setIsBookingSuccessful] = useState(false);
  const [bookingMessage, setBookingMessage] = useState('');

  const numberOfNights = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const diff = end.getTime() - start.getTime();
      const nights = Math.ceil(diff / (1000 * 60 * 60 * 24));
      return nights > 0 ? nights : 0;
    }
    return 0;
  }, [startDate, endDate]);

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

    const bookingData = {
    const bookingData = {
      roomId: room.id,
      startDate,
      endDate,
    };

    console.log('Booking details:', bookingData);

    bookingMutation.mutate(bookingData);
      startDate,
      endDate,
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
    <div className="min-h-screen bg-gray-50 pb-12">
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Section */}
      <section className="bg-gradient-to-r from-green-600 to-green-700 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-200" />
          <h1 className="text-4xl font-bold mb-2">Confirm Your Booking</h1>
          <p className="text-xl text-green-100">Review your reservation details below.</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 flex justify-center">
        <Card className="w-full max-w-3xl p-8 shadow-xl border border-gray-100">
          <CardHeader className="p-0 mb-6">
            <CardTitle className="text-3xl font-bold text-gray-800">Booking Details</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Room Image and Basic Info */}
              <div>
                <img
                  src={`${baseUrl}/${room.media[0]?.path || 'placeholder.svg'}`}
                  alt={room.type.name}
                  className="w-full h-56 object-cover rounded-lg shadow-md mb-4"
                />
                <h3 className="text-2xl font-bold text-green-700 mb-1">
                  {room.type.name} - Room {room.roomNumber}
                </h3>
                <p className="text-gray-600 text-sm">{room.shortDescription}</p>
              </div>

              {/* Dates and Capacity */}
              <div className="space-y-3 text-gray-700">
                <p className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Check-in:</span> {formatDateVN(startDate)}
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Check-out:</span> {formatDateVN(endDate)}
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <span className="font-semibold ml-7">{numberOfNights} nights</span>
                </p>
                <p className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-gray-500" />
                  <span className="font-semibold">Capacity:</span> {room.maxPeople} Guests
                </p>
              </div>
            </div>

            <Separator className="my-8" />

            {/* Amenities and Services */}
            <h3 className="text-xl font-semibold text-gray-800 mb-3">Room Amenities</h3>
            {roomTypes
              ?.find((type) => type.id === room.typeId)
              ?.roomTypeAddons?.map((addon, index) => {
                const service = services.find((s) => s.id === addon.serviceId);
                return (
                  <div key={index} className="flex items-center gap-1 text-sm text-gray-600">
                    <Badge variant="outlined">{service?.name || 'Không rõ'}</Badge>
                  </div>
                );
              })}
            <Separator className="my-8" />

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
