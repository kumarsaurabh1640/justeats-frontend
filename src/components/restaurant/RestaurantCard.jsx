import { Link } from 'react-router-dom';
import { Heart, MapPin, Star, UtensilsCrossed } from 'lucide-react';

export default function RestaurantCard({ restaurant, isFav, onToggleFav }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-44 bg-linear-to-br from-orange-100 to-orange-200 relative">
        {restaurant.image_url ? (
          <img src={restaurant.image_url} alt={restaurant.name} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full">
            <UtensilsCrossed className="w-16 h-16 text-orange-300" />
          </div>
        )}
        <button
          onClick={() => onToggleFav(restaurant.id)}
          className="absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm hover:scale-110 transition-transform"
        >
          <Heart className={`w-4 h-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between mb-1">
          <h2 className="font-semibold text-gray-900 text-lg leading-tight">{restaurant.name}</h2>
          {restaurant.rating && (
            <span className="flex items-center gap-1 text-sm font-medium text-amber-500 ml-2 shrink-0">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              {Number(restaurant.rating).toFixed(1)}
            </span>
          )}
        </div>
        {restaurant.cuisine_type && (
          <p className="text-sm text-orange-500 font-medium mb-1">{restaurant.cuisine_type}</p>
        )}
        {restaurant.location && (
          <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
            <MapPin className="w-3 h-3" /> {restaurant.location}
          </p>
        )}
        <Link
          to={`/restaurant/${restaurant.id}`}
          className="block w-full text-center bg-orange-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          View Menu
        </Link>
      </div>
    </div>
  );
}
