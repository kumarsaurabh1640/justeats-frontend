import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { restaurantsApi } from '../../api/restaurants';
import { menuItemsApi } from '../../api/menuItems';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Edit2, Eye, EyeOff, Plus, Star, Trash2, X } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FormField from '../../components/ui/FormField';

const schema = yup.object({
  name: yup.string().max(200).required('Name is required'),
  description: yup.string(),
  price: yup.number().typeError('Must be a number').positive('Must be positive').required('Price is required'),
  category: yup.string().max(100),
  image_url: yup.string().url('Must be a valid URL').nullable().transform((v) => v || null),
  is_available: yup.boolean(),
  is_special: yup.boolean(),
});

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';

export default function MenuManager() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [restaurants, setRestaurants] = useState([]);
  const [selectedId, setSelectedId] = useState(searchParams.get('restaurant') || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editItem, setEditItem] = useState(null); // null = hidden, {} = new item, item = edit
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { is_available: true, is_special: false },
  });

  // Load owner's restaurants once on mount
  useEffect(() => {
    restaurantsApi.list().then(({ data }) => {
      const mine = data.filter((r) => r.owner_id === user?.sub);
      setRestaurants(mine);
      if (!selectedId && mine.length > 0) setSelectedId(mine[0].id);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load menu items for selected restaurant
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    menuItemsApi
      .list(selectedId)
      .then(({ data }) => setItems(data))
      .catch(() => toast.error('Failed to load menu items'))
      .finally(() => setLoading(false));
  }, [selectedId]);

  const openAdd = () => {
    reset({ is_available: true, is_special: false });
    setEditItem({});
  };

  const openEdit = (item) => {
    reset(item);
    setEditItem(item);
  };

  const onSave = async (values) => {
    setSaving(true);
    try {
      if (editItem?.id) {
        const { data } = await menuItemsApi.update(selectedId, editItem.id, values);
        setItems((prev) => prev.map((i) => (i.id === editItem.id ? data : i)));
        toast.success('Menu item updated');
      } else {
        const { data } = await menuItemsApi.create(selectedId, values);
        setItems((prev) => [...prev, data]);
        toast.success('Menu item added');
      }
      setEditItem(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save menu item');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (item) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await menuItemsApi.delete(selectedId, item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success('Item deleted');
    } catch {
      toast.error('Failed to delete item');
    }
  };

  const toggleAvailable = async (item) => {
    try {
      const { data } = await menuItemsApi.toggleAvailable(selectedId, item.id);
      setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)));
      toast.success(data.is_available ? 'Item is now available' : 'Item marked unavailable');
    } catch {
      toast.error('Failed to update item');
    }
  };

  const toggleSpecial = async (item) => {
    try {
      const { data } = await menuItemsApi.toggleSpecial(selectedId, item.id);
      setItems((prev) => prev.map((i) => (i.id === item.id ? data : i)));
      toast.success(data.is_special ? 'Marked as Special' : 'Removed from Specials');
    } catch {
      toast.error('Failed to update item');
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Menu Manager</h1>
        <button
          onClick={openAdd}
          disabled={!selectedId}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

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

      {/* Item form modal */}
      {editItem !== null && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-4 sm:p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editItem?.id ? 'Edit Item' : 'Add Menu Item'}</h2>
              <button onClick={() => setEditItem(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSave)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Name *" error={errors.name?.message}>
                  <input {...register('name')} className={inputCls} />
                </FormField>
                <FormField label="Price (£) *" error={errors.price?.message}>
                  <input {...register('price')} type="number" step="0.01" className={inputCls} />
                </FormField>
                <FormField label="Category" error={errors.category?.message}>
                  <input {...register('category')} placeholder="e.g. Starters" className={inputCls} />
                </FormField>
                <FormField label="Image URL" error={errors.image_url?.message}>
                  <input {...register('image_url')} placeholder="https://…" className={inputCls} />
                </FormField>
              </div>
              <FormField label="Description" error={errors.description?.message}>
                <textarea {...register('description')} rows={2} className={`${inputCls} resize-none`} />
              </FormField>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input {...register('is_available')} type="checkbox" className="accent-orange-500 w-4 h-4" />
                  Available
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm">
                  <input {...register('is_special')} type="checkbox" className="accent-orange-500 w-4 h-4" />
                  Special
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60"
                >
                  {saving ? 'Saving…' : (editItem?.id ? 'Update' : 'Add Item')}
                </button>
                <button type="button" onClick={() => setEditItem(null)} className="flex-1 border border-gray-300 py-2.5 rounded-lg text-sm hover:bg-gray-50">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Menu items list */}
      {!selectedId ? (
        <p className="text-gray-400 text-center py-20">Select a restaurant to manage its menu.</p>
      ) : loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-400">
          <p>No menu items yet. Click "Add Item" to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item.id} className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 ${!item.is_available ? 'opacity-60' : ''}`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  {item.is_special && <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Special</span>}
                  {!item.is_available && <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Unavailable</span>}
                </div>
                {item.category && <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>}
                <p className="text-orange-600 font-semibold text-sm mt-1">£{Number(item.price).toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-1.5">
                <button onClick={() => toggleSpecial(item)} title="Toggle special" className="p-2 rounded-lg hover:bg-yellow-50 text-gray-400 hover:text-yellow-500">
                  <Star className={`w-4 h-4 ${item.is_special ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                </button>
                <button onClick={() => toggleAvailable(item)} title="Toggle available" className="p-2 rounded-lg hover:bg-gray-100 text-gray-400">
                  {item.is_available ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-500">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteItem(item)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
