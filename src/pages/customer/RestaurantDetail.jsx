import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants';
import { menuItemsApi } from '../../api/menuItems';
import { cartApi } from '../../api/cart';
import { favouritesApi } from '../../api/favourites';
import toast from 'react-hot-toast';
import { ArrowLeft, Flame, Heart, MapPin, ShoppingCart, SlidersHorizontal, Star, UtensilsCrossed } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import MenuItemCard from '../../components/restaurant/MenuItemCard';

export default function RestaurantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [mostlyOrdered, setMostlyOrdered] = useState([]);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [restRes, menuRes, favRes, mostlyRes] = await Promise.all([
          restaurantsApi.get(id),
          menuItemsApi.list(id),
          favouritesApi.list(),
          menuItemsApi.mostlyOrdered(id).catch(() => ({ data: [] })),
        ]);
        setRestaurant(restRes.data);
        setMenuItems(menuRes.data);
        setIsFav(favRes.data.some((r) => r.id === id));
        setMostlyOrdered(mostlyRes.data);
      } catch {
        toast.error('Failed to load restaurant');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  const toggleFav = async () => {
    try {
      if (isFav) {
        await favouritesApi.remove(id);
        setIsFav(false);
        toast.success('Removed from favourites');
      } else {
        await favouritesApi.add(id);
        setIsFav(true);
        toast.success('Added to favourites');
      }
    } catch {
      toast.error('Could not update favourites');
    }
  };

  const addToCart = async (item) => {
    setAddingId(item.id);
    try {
      await cartApi.add(item.id, 1);
      localStorage.setItem('cart_restaurant_id', id);
      toast.success(`${item.name} added to cart`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add to cart');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <LoadingSpinner fullPage />;
  if (!restaurant) return null;

  const categories = [...new Set(menuItems.map((m) => m.category || 'Other'))];

  const filtered = menuItems.filter((item) => {
    const matchCat = categoryFilter ? (item.category || 'Other') === categoryFilter : true;
    const matchMin = minPrice ? Number(item.price) >= Number(minPrice) : true;
    const matchMax = maxPrice ? Number(item.price) <= Number(maxPrice) : true;
    return matchCat && matchMin && matchMax;
  });

  const grouped = Object.fromEntries(
    categories.map((cat) => [cat, filtered.filter((m) => (m.category || 'Other') === cat)])
  );

  return (
    <div>
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Restaurant header */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8">
        <div className="h-52 bg-linear-to-br from-orange-100 to-orange-200 relative">
          {restaurant.image_url ? (
            <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <UtensilsCrossed className="w-20 h-20 text-orange-300" />
            </div>
          )}
        </div>
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{restaurant.name}</h1>
            {restaurant.cuisine_type && <p className="text-orange-500 font-medium mt-1">{restaurant.cuisine_type}</p>}
            {restaurant.location && (
              <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5" /> {restaurant.location}
              </p>
            )}
            {restaurant.description && <p className="text-gray-600 text-sm mt-2">{restaurant.description}</p>}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {restaurant.rating && (
              <span className="flex items-center gap-1 text-amber-500 font-semibold">
                <Star className="w-4 h-4 fill-amber-500" />
                {Number(restaurant.rating).toFixed(1)}
              </span>
            )}
            <button onClick={toggleFav} className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50">
              <Heart className={`w-5 h-5 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </button>
            <button onClick={() => navigate('/cart')} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-orange-600">
              <ShoppingCart className="w-4 h-4" /> Cart
            </button>
          </div>
        </div>
      </div>

      {/* Mostly Ordered section */}
      {mostlyOrdered.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500" /> Mostly Ordered
          </h2>
          <div className="space-y-3">
            {mostlyOrdered.map((item) => (
              <MenuItemCard key={item.id} item={item} onAdd={addToCart} addingId={addingId} />
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Full Menu</h2>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="flex items-center gap-2 text-sm border border-gray-300 rounded-xl px-3 py-2 hover:bg-gray-50"
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </button>
      </div>

      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">All</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Price (£)</label>
            <input
              type="number" min="0" step="0.01" value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0.00"
              className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Price (£)</label>
            <input
              type="number" min="0" step="0.01" value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              className="w-24 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <button
            onClick={() => { setMinPrice(''); setMaxPrice(''); setCategoryFilter(''); }}
            className="text-sm text-gray-500 hover:text-red-500 px-3 py-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Menu grouped by category */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-12">No items match your filters.</p>
      ) : (
        categories.map((cat) =>
          grouped[cat]?.length > 0 ? (
            <div key={cat} className="mb-8">
              <h2 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">{cat}</h2>
              <div className="space-y-3">
                {grouped[cat].map((item) => (
                  <MenuItemCard key={item.id} item={item} onAdd={addToCart} addingId={addingId} />
                ))}
              </div>
            </div>
          ) : null
        )
      )}
    </div>
  );
}