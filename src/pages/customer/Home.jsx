import { useEffect, useState } from 'react';
import { restaurantsApi } from '../../api/restaurants';
import { favouritesApi } from '../../api/favourites';
import { recommendationsApi } from '../../api/recommendations';
import toast from 'react-hot-toast';
import { Search, Sparkles, UtensilsCrossed, Heart } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import RestaurantCard from '../../components/restaurant/RestaurantCard';

export default function Home() {
  const [restaurants, setRestaurants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [favouriteIds, setFavouriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [cuisineFilter, setCuisineFilter] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [restRes, favRes, recRes] = await Promise.all([
          restaurantsApi.list(),
          favouritesApi.list(),
          recommendationsApi.get().catch(() => ({ data: [] })),
        ]);
        setRestaurants(restRes.data);
        setFavouriteIds(new Set(favRes.data.map((r) => r.id)));
        setRecommendations(recRes.data);
      } catch {
        toast.error('Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const toggleFavourite = async (restaurantId) => {
    const isFav = favouriteIds.has(restaurantId);
    try {
      if (isFav) {
        await favouritesApi.remove(restaurantId);
        setFavouriteIds((prev) => { const s = new Set(prev); s.delete(restaurantId); return s; });
        toast.success('Removed from favourites');
      } else {
        await favouritesApi.add(restaurantId);
        setFavouriteIds((prev) => new Set([...prev, restaurantId]));
        toast.success('Added to favourites');
      }
    } catch {
      toast.error('Could not update favourites');
    }
  };

  const cuisines = [...new Set(restaurants.map((r) => r.cuisine_type).filter(Boolean))];

  const favouriteRestaurants = restaurants.filter((r) => favouriteIds.has(r.id));

  // A single search term matches restaurant name, location, OR cuisine type
  const filtered = restaurants.filter((r) => {
    const matchSearch = search
      ? r.name.toLowerCase().includes(search.toLowerCase()) ||
        (r.location || '').toLowerCase().includes(search.toLowerCase()) ||
        (r.cuisine_type || '').toLowerCase().includes(search.toLowerCase())
      : true;
    const matchCuisine = cuisineFilter ? r.cuisine_type === cuisineFilter : true;
    return matchSearch && matchCuisine;
  });

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      {/* Hero search */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">What are you craving? 🍔</h1>
        <p className="text-gray-500 mb-6">Order from the best restaurants near you</p>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, location or cuisine…"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>

          <select
            value={cuisineFilter}
            onChange={(e) => setCuisineFilter(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
          >
            <option value="">All cuisines</option>
            {cuisines.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Recommendations — hidden while the user is actively searching */}
      {recommendations.length > 0 && !search && !cuisineFilter && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" /> Recommended for You
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                isFav={favouriteIds.has(r.id)}
                onToggleFav={toggleFavourite}
              />
            ))}
          </div>
        </div>
      )}

      {/* Favourites — hidden while the user is actively searching */}
      {favouriteRestaurants.length > 0 && !search && !cuisineFilter && (
        <div className="mb-10">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Your Favourites
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favouriteRestaurants.map((r) => (
              <RestaurantCard
                key={r.id}
                restaurant={r}
                isFav={true}
                onToggleFav={toggleFavourite}
              />
            ))}
          </div>
        </div>
      )}

      {/* All restaurants */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {search || cuisineFilter ? `Results (${filtered.length})` : 'All Restaurants'}
        </h2>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <UtensilsCrossed className="w-12 h-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg">No restaurants found</p>
            <button
              onClick={() => { setSearch(''); setCuisineFilter(''); }}
              className="mt-3 text-orange-500 text-sm hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                isFav={favouriteIds.has(restaurant.id)}
                onToggleFav={toggleFavourite}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}