import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants';
import { ordersApi } from '../../api/orders';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PREPARING: 'bg-purple-100 text-purple-700',
  READY: 'bg-teal-100 text-teal-700',
  COMPLETED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const NEXT_STATUSES = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY'],
  READY: ['COMPLETED'],
  COMPLETED: [],
  CANCELLED: [],
};

export default function OrderManager() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('restaurant') || '');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    restaurantsApi.mine().then(({ data }) => {
      setRestaurants(data);
      if (!selectedId && data.length > 0) setSelectedId(data[0].id);
    }).catch(() => toast.error('Failed to load restaurants'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    ordersApi
      .restaurantOrders(selectedId)
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const updateStatus = async (orderId, status) => {
    setUpdatingId(orderId);
    try {
      const { data } = await ordersApi.updateStatus(orderId, status);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data : o)));
      toast.success(`Order marked as ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update order');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <ClipboardList className="w-6 h-6 text-orange-500" /> Order Manager
      </h1>

      {/* Restaurant selector */}
      <div className="mb-6">
        <select
          value={selectedId}
          onChange={(e) => { setSelectedId(e.target.value); setSearchParams({ restaurant: e.target.value }); }}
          className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">Select a restaurant</option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <p className="text-gray-400 text-center py-20">Select a restaurant to view its orders.</p>
      ) : loading ? (
        <LoadingSpinner />
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-400">
          <p>No orders yet for this restaurant.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                onClick={() => setExpanded((prev) => (prev === order.id ? null : order.id))}
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 text-left">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}>
                    {order.status}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''} ·{' '}
                      <span className="text-orange-600 font-semibold">₹{Number(order.total_amount).toFixed(2)}</span>
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {order.created_at ? format(new Date(order.created_at), 'dd MMM yyyy, HH:mm') : 'Just now'}
                    </p>
                  </div>
                </div>
                {expanded === order.id ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>

              {expanded === order.id && (
                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  {order.special_instructions && (
                    <p className="text-xs text-gray-500 italic mb-3">Note: "{order.special_instructions}"</p>
                  )}

                  <div className="space-y-2 mb-4">
                    {order.order_items.map((oi) => (
                      <div key={oi.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">{oi.quantity}× {oi.name || 'Item'}</span>
                        <span className="font-medium">₹{Number(oi.subtotal).toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t pt-2 flex justify-between font-semibold text-sm">
                      <span>Total</span>
                      <span className="text-orange-600">₹{Number(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Status actions */}
                  {NEXT_STATUSES[order.status]?.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {NEXT_STATUSES[order.status].map((nextStatus) => (
                        <button
                          key={nextStatus}
                          onClick={() => updateStatus(order.id, nextStatus)}
                          disabled={updatingId === order.id}
                          className={`text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-60 ${
                            nextStatus === 'CANCELLED'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                          }`}
                        >
                          {updatingId === order.id ? '…' : `→ ${nextStatus}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
