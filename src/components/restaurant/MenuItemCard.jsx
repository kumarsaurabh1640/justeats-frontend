import { Flame, Plus } from 'lucide-react';

export default function MenuItemCard({ item, onAdd, addingId }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 ${!item.is_available ? 'opacity-50' : ''}`}>
      {item.image_url && (
        <img src={item.image_url} alt={item.name} className="w-16 h-16 rounded-lg object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-medium text-gray-900">{item.name}</h3>
          {item.is_special && (
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-medium">Special</span>
          )}
          {item.order_count >= 10 && (
            <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
              <Flame className="w-3 h-3" /> Mostly Ordered
            </span>
          )}
          {!item.is_available && (
            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unavailable</span>
          )}
        </div>
        {item.description && (
          <p className="text-sm text-gray-500 mt-0.5 truncate">{item.description}</p>
        )}
        <p className="text-orange-600 font-semibold mt-1">£{Number(item.price).toFixed(2)}</p>
      </div>
      <button
        onClick={() => onAdd(item)}
        disabled={!item.is_available || addingId === item.id}
        className="flex items-center gap-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
      >
        <Plus className="w-4 h-4" />
        {addingId === item.id ? '…' : 'Add'}
      </button>
    </div>
  );
}
