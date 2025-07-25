import { ShoppingCart } from 'lucide-react';
import { formatCurrencyUSD } from '../../libs/utils';
import CartItems from './CartItems';
import { useSelector } from 'react-redux';
import { cartSelector } from '@src/stores/reducers/cartReducer';
import { Button } from '@ui/button';
import { useNavigate } from 'react-router';
import Cookies from 'js-cookie';
import { useCart } from '@src/hooks/useCart';
import { useMutation } from '@tanstack/react-query';
import bookingApi from '@apis/booking';

export default function Cart() {
  const cart = useSelector(cartSelector.selectCart);
  const booking = useSelector(cartSelector.booking);
  const navigate = useNavigate();
  const { clear } = useCart();

  const totalAmount = cart.reduce((sum, item) => {
    const start = new Date(item.startDate);
    const end = new Date(item.endDate);

    const msPerDay = 1000 * 60 * 60 * 24;
    const numberOfDays = Math.max(
      1,
      Math.ceil((end - start) / msPerDay) // include the end date
    );

    return sum + item.price * item.quantity * numberOfDays;
  }, 0);

  const { mutate: placeOrder, isPending: isBookingService } = useMutation({
    mutationFn: bookingApi.bookingService,
    onSuccess: () => {
      clear(); // clear the cart
      alert('Booking services successfully!');
    },
    onError: (error) => {
      console.error('Error adding services to booking:', error);
      alert('An error occurred while placing your order. Please try again.');
    },
  });

  const handlePlaceOrder = () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      return navigate('/login');
    }

    if (cart.length === 0) {
      alert('Your cart is empty. Please add items before placing an order.');
      return;
    }

    const bookingServiceData = {
      bookingId: booking.id,
      services: cart.map((s) => ({
        serviceId: s.id,
        quantity: s.quantity,
        startDate: s.startDate,
        endDate: s.endDate,
      })),
    };

    placeOrder(bookingServiceData);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 bg-white/80">
      <h2 className="p-4 text-lg mb-2 flex gap-2 bg-teal-100/80 text-teal-700 font-bold">
        <ShoppingCart /> Cart
      </h2>
      <div className="p-4">
        {cart.length === 0 ? (
          <div className="text-center p-4 text-gray-400 text-sm center-both flex-col gap-4">
            <div className="p-4 rounded-full center-both w-14 h-14 bg-gray-300/50">
              <ShoppingCart size={28} strokeWidth={2.75} />
            </div>
            Your cart is empty.
            <br />
            Please select services to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((service) => (
              <CartItems key={service.uuid} service={service} />
            ))}
          </div>
        )}
        <div className="border-b border-gray-300 my-4"></div>
        <div className="px-4 py-2 bg-teal-100/80 rounded-md flex justify-between font-semibold">
          <h1>Total:</h1>
          <p className="text-teal-700">{formatCurrencyUSD(totalAmount)}</p>
        </div>
        <Button
          className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white h-12 transition-colors duration-200"
          onClick={handlePlaceOrder}
          disabled={isBookingService || cart.length === 0}
        >
          {isBookingService
            ? 'Booking...'
            : Cookies.get('accessToken')
            ? 'Add services to booking'
            : 'Log in to add services'}
        </Button>
      </div>
    </div>
  );
}
