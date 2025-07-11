import { Star, Gift, Sparkles } from 'lucide-react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@src/hooks/useCart';
import { formatCurrencyVND } from '@src/libs/utils';

const iconMap = [
  <Gift key={0} className="w-5 h-5 text-green-600" />,
  <Star key={1} className="w-5 h-5 text-green-600" />,
  <Sparkles key={2} className="w-5 h-5 text-green-600" />,
];

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const { add } = useCart();

  const handleAddToCart = () => {
    const token = Cookies.get('accessToken');
    if (!token) {
      return navigate('/login');
    }
    add(service);
  };

  const { id, name, description, price } = service;

  return (
    <div className="bg-white/90 border border-gray-300 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="p-2 bg-green-100 rounded-lg">{iconMap[id % 3]}</div>
          <span>{name}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="text-right min-w-[140px]">
        <p className="font-bold text-green-700 text-lg">{formatCurrencyVND(price)}</p>
        <button
          onClick={handleAddToCart}
          className="mt-2 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm"
        >
          + Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
