import { useCartStore } from "../stores/useCartStore";

const CartPage = () => {
  const { cart } = useCartStore();
  return (
    <div>
      <div className="mx-auto max-w-screen-xl px-4 2xl:px-0"></div>
    </div>
  );
};

export default CartPage;
