import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { UtensilsCrossed } from 'lucide-react';
import FormField from '../../components/ui/FormField';

const schema = yup.object({
  new_password: yup.string().min(8, 'At least 8 characters').required('Password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async ({ new_password }) => {
    if (!token) {
      toast.error('Missing reset token. Please use the link from your email.');
      return;
    }
    try {
      await authApi.resetPassword(token, new_password);
      toast.success('Password reset! Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Reset failed. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center max-w-sm">
          <p className="text-gray-700 mb-4">Invalid reset link. Please request a new one.</p>
          <Link to="/forgot-password" className="text-orange-500 font-medium hover:underline">
            Forgot Password →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-100 p-3 rounded-xl mb-3">
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter and confirm your new password</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="New Password" error={errors.new_password?.message}>
            <input
              {...register('new_password')}
              type="password"
              placeholder="Min. 8 characters"
              className={inputCls}
            />
          </FormField>

          <FormField label="Confirm Password" error={errors.confirm_password?.message}>
            <input
              {...register('confirm_password')}
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
            {isSubmitting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
