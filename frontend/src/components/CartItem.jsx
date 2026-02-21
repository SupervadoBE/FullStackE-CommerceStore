import { Minus, Plus, Trash } from "lucide-react";
import { useCartStore } from "../stores/useCartStore";

const CartItem = ({ item }) => {
  const { removeFromCart, updateQuantity } = useCartStore();
  return (
    <div className="rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6">
      <div className="space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0">
        <div className="shrink-0 md:order-1">
          <img src={item.image} alt={item.name} className="h-20 md:h-32 rounded object-cover" />
        </div>
        <label className="sr-only">Choose quantity:</label>
      </div>
    </div>
  );
};

export default CartItem;
