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

export default function Cart() {
  const cart = useSelector(cartSelector.selectCart);
  const navigate = useNavigate();
  const { clear } = useCart;

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const { mutate: placeOrder, isPending: isPlacingOrder } = useMutation({
    mutationFn: () => {},
    onSuccess: (data) => {
      if (data.success) {
        clear(); // xoá giỏ hàng
      } else {
        alert('Có lỗi xảy ra khi thêm dịch vụ. Vui lòng thử lại.');
      }
    },
    onError: (error) => {
      console.error('Error adding services to booking:', error);
      alert('Có lỗi xảy ra khi thêm dịch vụ. Vui lòng thử lại.');
    },
  });

  const handlePlaceOrder = () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      return navigate('/login');
    }

    if (cart.length === 0) {
      alert('Giỏ hàng của bạn đang trống. Vui lòng thêm dịch vụ để đặt.');
      return;
    }

    placeOrder(); // gọi mutation
  };

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 bg-white/80">
      <h2 className="p-4 text-lg mb-2 flex gap-2 bg-teal-100/80 text-teal-700 font-bold">
        <ShoppingCart /> Giỏ hàng
      </h2>
      <div className="p-4">
        {cart.length === 0 ? (
          <div className="text-center p-4 text-gray-400 text-sm center-both flex-col gap-4">
            <div className="p-4 rounded-full center-both w-14 h-14 bg-gray-300/50">
              <ShoppingCart size={28} strokeWidth={2.75} />
            </div>
            Giỏ hàng trống
            <br />
            Chọn dịch vụ để bắt đầu
          </div>
        ) : (
          <div className="space-y-2">
            {cart.map((item) => (
              <CartItems key={item.id} item={item} />
            ))}
          </div>
        )}
        <div className="border-b border-gray-300 my-4"></div>
        <div className="px-4 py-2 bg-teal-100/80 rounded-md flex justify-between font-semibold">
          <h1>Tổng cộng:</h1>
          <p className="text-teal-700">{formatCurrencyUSD(totalAmount)}</p>
        </div>
        <Button
          className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white h-12 transition-colors duration-200"
          onClick={handlePlaceOrder}
          disabled={isPlacingOrder || cart.length === 0}
        >
          {isPlacingOrder
            ? 'Đang thêm...'
            : Cookies.get('accessToken')
            ? 'Thêm dịch vụ vào đơn phòng'
            : 'Đăng nhập để thêm dịch vụ'}
        </Button>
      </div>
    </div>
  );
}
