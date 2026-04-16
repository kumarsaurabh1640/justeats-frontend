import { useEffect, useState } from 'react';
import { ordersApi } from '../../api/orders';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Package, Search } from 'lucide-react';
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

const ALL_STATUSES = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    ordersApi
      .myOrders()
      .then(({ data }) => setOrders(data))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner fullPage />;

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter ? o.status === statusFilter : true;
    const matchSearch = search
      ? o.status.toLowerCase().includes(search.toLowerCase()) ||
        o.order_items.some((oi) =>
          (oi.name ?? '').toLowerCase().includes(search.toLowerCase())
        )
      : true;
    return matchStatus && matchSearch;
  });

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Package className="w-6 h-6 text-orange-500" /> My Orders
      </h1>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by item name or status…"
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-14 h-14 mx-auto mb-4 opacity-40" />
          <p className="text-lg">{orders.length === 0 ? 'No orders yet' : 'No orders match your filters'}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((order) => {
            const itemNames = order.order_items.map((oi) => oi.name ?? 'Unknown item');
            const previewNames = itemNames.slice(0, 3).join(', ') + (itemNames.length > 3 ? ` +${itemNames.length - 3} more` : '');

            return (
              <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setExpanded((prev) => (prev === order.id ? null : order.id))}
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3 text-left">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                      {order.status}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-900 leading-snug">
                        {previewNames}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        <span className="text-orange-600 font-semibold">₹{Number(order.total_amount).toFixed(2)}</span>
                        {' · '}
                        {order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {order.created_at
                          ? format(new Date(order.created_at), 'dd MMM yyyy, HH:mm')
                          : 'Just now'}
                      </p>
                    </div>
                  </div>
                  {expanded === order.id
                    ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                </button>

                {expanded === order.id && (
                  <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                    {order.special_instructions && (
                      <p className="text-xs text-gray-500 italic mb-3">"{order.special_instructions}"</p>
                    )}
                    <div className="space-y-2">
                      {order.order_items.map((oi) => (
                        <div key={oi.id} className="flex justify-between text-sm">
                          <span className="text-gray-700">
                            {oi.quantity}× <span className="font-medium">{oi.name ?? 'Unknown item'}</span>
                          </span>
                          <span className="text-gray-900 font-medium">₹{Number(oi.subtotal).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-orange-600">₹{Number(order.total_amount).toFixed(2)}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}