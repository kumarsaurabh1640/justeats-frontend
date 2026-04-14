import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { UtensilsCrossed } from 'lucide-react';
import FormField from '../../components/ui/FormField';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().min(8, 'At least 8 characters').required('Password is required'),
});

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async ({ email, password }) => {
    try {
      const decoded = await login(email, password);
      toast.success('Welcome back!');
      navigate(decoded.role === 'owner' ? '/owner/dashboard' : '/');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-100 p-3 rounded-xl mb-3">
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Sign in to JustEats</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back!</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message}>
            <input
              {...register('email')}
              type="email"
              placeholder="you@example.com"
              className={inputCls}
            />
          </FormField>

          <FormField label="Password" error={errors.password?.message}>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className={inputCls}
            />
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Signing in…' : 'Sign In'}
          </button>

          <div className="text-center">
            <Link to="/forgot-password" className="text-sm text-gray-500 hover:text-orange-500">
              Forgot your password?
            </Link>
          </div>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-orange-500 font-medium hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
