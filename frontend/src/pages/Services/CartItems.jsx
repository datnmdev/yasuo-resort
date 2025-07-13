import { useCart } from '@src/hooks/useCart';
import { Button } from '@ui/button';
import { Gift, Minus, Plus, Sparkles, Star, X } from 'lucide-react';

const iconMap = [
  <Gift key={0} className="w-5 h-5 text-teal-600" />,
  <Star key={1} className="w-5 h-5 text-teal-600" />,
  <Sparkles key={2} className="w-5 h-5 text-teal-600" />,
];
export default function CartItems({ item }) {
  const { update, remove } = useCart();

  return (
    <div key={item.id} className="border border-gray-200 rounded-lg p-4 transition-colors duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
            {iconMap[item.id % 3]}
          </div>
          <h4 className="font-medium text-sm">{item.name}</h4>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-gray-400 transition-colors duration-200 hover:bg-gray-100/80"
          onClick={() => remove(item.id)}
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <span className="font-semibold text-emerald-600">{item.price.toLocaleString('vi-VN')}đ</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent transition-colors duration-200 hover:bg-teal-600 hover:text-white"
            onClick={() => update(item.id, -1)}
          >
            <Minus className="w-3 h-3" />
          </Button>
          <span className="w-6 text-center font-medium">{item.quantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 bg-transparent transition-colors duration-200 hover:bg-teal-600 hover:text-white"
            onClick={() => update(item.id, 1)}
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
