import { ShoppingCart } from 'lucide-react';
import { formatCurrencyVND } from '../../libs/utils';
import CartItems from './CartItems';
import { useSelector } from 'react-redux';
import { cartSelector } from '@src/stores/reducers/cartReducer';

export default function Cart() {
  const cart = useSelector(cartSelector.selectCart);
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="rounded-lg overflow-hidden border border-gray-300 bg-white/80">
      <h2 className="p-4 text-lg mb-2 flex gap-2 bg-green-100/80 text-green-700 font-bold">
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
        <div className="px-4 py-2 bg-green-100/80 rounded-md flex justify-between font-semibold">
          <h1>Tổng cộng:</h1>
          <p className="text-green-700">{formatCurrencyVND(totalAmount)}</p>
        </div>
      </div>
    </div>
  );
}
