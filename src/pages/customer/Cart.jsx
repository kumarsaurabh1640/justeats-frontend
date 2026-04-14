import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { ordersApi } from '../../api/orders';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, Trash2, X } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { useForm } from 'react-hook-form';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit } = useForm();

  const load = async () => {
    try {
      const { data } = await cartApi.get();
      setItems(data);
    } catch {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return removeItem(itemId);
    try {
      const { data } = await cartApi.update(itemId, quantity);
      setItems((prev) => prev.map((i) => (i.id === itemId ? data : i)));
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartApi.remove(itemId);
      setItems((prev) => prev.filter((i) => i.id !== itemId));
      toast.success('Item removed');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearCart = async () => {
    try {
      await cartApi.clear();
      setItems([]);
      localStorage.removeItem('cart_restaurant_id');
      toast.success('Cart cleared');
    } catch {
      toast.error('Failed to clear cart');
    }
  };

  const placeOrder = async ({ special_instructions }) => {
    const restaurantId = localStorage.getItem('cart_restaurant_id');
    if (!restaurantId) {
      toast.error('Restaurant info missing. Please add items from a restaurant page.');
      return;
    }
    setPlacing(true);
    try {
      await ordersApi.place({
        restaurant_id: restaurantId,
        items: items.map((i) => ({ menu_item_id: i.menu_item_id, quantity: i.quantity })),
        special_instructions: special_instructions || undefined,
      });
      await cartApi.clear();
      localStorage.removeItem('cart_restaurant_id');
      toast.success('Order placed! 🎉');
      navigate('/orders');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  const total = items.reduce((sum, i) => sum + Number(i.subtotal), 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-orange-500" /> Your Cart
        </h1>
        {items.length > 0 && (
          <button onClick={clearCart} className="text-sm text-red-500 hover:underline flex items-center gap-1">
            <X className="w-4 h-4" /> Clear all
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg">Your cart is empty</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-orange-600"
          >
            Browse Restaurants
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-3 mb-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-500">£{Number(item.unit_price).toFixed(2)} each</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500 shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQty(item.id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="w-6 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <p className="font-semibold text-gray-900">£{Number(item.subtotal).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex justify-between text-lg font-bold mb-6">
              <span>Total</span>
              <span className="text-orange-600">£{total.toFixed(2)}</span>
            </div>

            <form onSubmit={handleSubmit(placeOrder)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Special instructions (optional)
                </label>
                <textarea
                  {...register('special_instructions')}
                  rows={2}
                  placeholder="Allergies, preferences…"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
                />
              </div>
              <button
                type="submit"
                disabled={placing}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {placing ? 'Placing order…' : 'Place Order'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
