import { Star, Gift, Sparkles } from 'lucide-react';
import { useCart } from '@src/hooks/useCart';
import { formatCurrencyUSD } from '@src/libs/utils';

const iconMap = [
  <Gift key={0} className="w-5 h-5 text-teal-600" />,
  <Star key={1} className="w-5 h-5 text-teal-600" />,
  <Sparkles key={2} className="w-5 h-5 text-teal-600" />,
];

export default function ServiceCard({ service }) {
  const { id, name, description, price } = service;
  const { add } = useCart();

  return (
    <div className="bg-white/90 border border-gray-300 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
      <div className="flex-1 pr-4">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <div className="p-2 bg-teal-100 rounded-lg">{iconMap[id % 3]}</div>
          <span>{name}</span>
        </div>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="text-right min-w-[140px]">
        <p className="font-bold text-teal-700 text-lg">{formatCurrencyUSD(price)}</p>
        <button
          onClick={() => add(service)}
          className="mt-2 px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm"
        >
          + Thêm vào giỏ
        </button>
      </div>
    </div>
  );
}
