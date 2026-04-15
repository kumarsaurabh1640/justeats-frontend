import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { restaurantsApi } from '../../api/restaurants';
import { profileApi } from '../../api/profile';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ClipboardList, LayoutDashboard, Menu, Plus, X } from 'lucide-react';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import FormField from '../../components/ui/FormField';

const schema = yup.object({
  name: yup.string().max(200).required('Restaurant name is required'),
  cuisine_type: yup.string().max(100),
  location: yup.string().max(300),
  description: yup.string(),
  image_url: yup.string().url('Must be a valid URL').nullable().transform((v) => v || null),
});

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';

export default function Dashboard() {
  const { user } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const loadRestaurants = async () => {
    try {
      const [restaurantsRes, profileRes] = await Promise.all([
        restaurantsApi.mine(),
        profileApi.getOwner(),
      ]);
      setRestaurants(restaurantsRes.data);
      setOwnerName(profileRes.data.full_name || '');
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadRestaurants(); }, []);

  const onCreate = async (values) => {
    try {
      const { data } = await restaurantsApi.create(values);
      setRestaurants((prev) => [...prev, data]);
      reset();
      setShowForm(false);
      toast.success('Restaurant created!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create restaurant');
    }
  };

  const toggleActive = async (r) => {
    try {
      const { data } = await restaurantsApi.update(r.id, { is_active: !r.is_active });
      setRestaurants((prev) => prev.map((x) => (x.id === r.id ? data : x)));
      toast.success(data.is_active ? 'Restaurant activated' : 'Restaurant deactivated');
    } catch {
      toast.error('Failed to update restaurant');
    }
  };

  if (loading) return <LoadingSpinner fullPage />;

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-orange-500" /> Dashboard
          </h1>
          {ownerName && (
            <p className="text-sm text-gray-500 mt-0.5">Welcome back, <span className="font-medium text-gray-700">{ownerName}</span>!</p>
          )}
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Cancel' : 'New Restaurant'}
        </button>
      </div>

      {/* Create restaurant form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Add New Restaurant</h2>
          <form onSubmit={handleSubmit(onCreate)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Restaurant Name *" error={errors.name?.message}>
                <input {...register('name')} placeholder="e.g. Pizza Palace" className={inputCls} />
              </FormField>
              <FormField label="Cuisine Type" error={errors.cuisine_type?.message}>
                <input {...register('cuisine_type')} placeholder="e.g. Italian" className={inputCls} />
              </FormField>
              <FormField label="Location" error={errors.location?.message}>
                <input {...register('location')} placeholder="e.g. London, UK" className={inputCls} />
              </FormField>
              <FormField label="Image URL" error={errors.image_url?.message}>
                <input {...register('image_url')} placeholder="https://…" className={inputCls} />
              </FormField>
            </div>
            <FormField label="Description" error={errors.description?.message}>
              <textarea {...register('description')} rows={2} placeholder="Short description…" className={`${inputCls} resize-none`} />
            </FormField>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60"
              >
                {isSubmitting ? 'Creating…' : 'Create Restaurant'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 rounded-lg border border-gray-300 text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Restaurant list */}
      {restaurants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 text-gray-400">
          <p className="text-lg mb-2">No restaurants yet</p>
          <p className="text-sm">Click "New Restaurant" to get started.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {restaurants.map((r) => (
            <div key={r.id} className={`bg-white rounded-xl border p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-opacity ${r.is_active ? 'border-gray-200' : 'border-gray-200 opacity-60'}`}>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{r.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${r.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {r.is_active ? 'Active' : 'Inactive'}
                  </span>
                  {!r.is_active && (
                    <span className="text-xs text-gray-400 italic">Hidden from customers</span>
                  )}
                </div>
                {r.cuisine_type && <p className="text-sm text-orange-500 mt-0.5">{r.cuisine_type}</p>}
                {r.location && <p className="text-xs text-gray-500 mt-0.5">{r.location}</p>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Link
                  to={`/owner/menu?restaurant=${r.id}`}
                  className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <Menu className="w-4 h-4" /> Menu
                </Link>
                <Link
                  to={`/owner/orders?restaurant=${r.id}`}
                  className="flex items-center gap-1.5 text-sm border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50"
                >
                  <ClipboardList className="w-4 h-4" /> Orders
                </Link>
                <button
                  onClick={() => toggleActive(r)}
                  className={`text-sm px-3 py-2 rounded-lg font-medium ${r.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                >
                  {r.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
