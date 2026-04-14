import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link } from 'react-router-dom';
import { authApi } from '../../api/auth';
import toast from 'react-hot-toast';
import { ArrowLeft, UtensilsCrossed } from 'lucide-react';
import { useState } from 'react';

const schema = yup.object({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [debugToken, setDebugToken] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: yupResolver(schema) });

  const onSubmit = async ({ email }) => {
    try {
      const { data } = await authApi.forgotPassword(email);
      setSent(true);
      // Dev mode: backend returns the token directly when DEBUG=true
      if (data.reset_token) setDebugToken(data.reset_token);
      toast.success('Reset instructions sent!');
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-orange-100 p-3 rounded-xl mb-3">
            <UtensilsCrossed className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Enter your email and we'll send reset instructions
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 text-sm text-center">
              If that email is registered, you will receive reset instructions shortly.
            </div>

            {/* Dev mode helper — shows reset URL for testing without email */}
            {debugToken && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs space-y-2">
                <p className="font-semibold text-yellow-800">🛠 Dev Mode — Reset Token</p>
                <p className="text-yellow-700 break-all font-mono">{debugToken}</p>
                <Link
                  to={`/reset-password?token=${debugToken}`}
                  className="inline-block text-orange-600 underline font-medium"
                >
                  Click here to reset password →
                </Link>
              </div>
            )}

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="you@example.com"
                  className={inputCls}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Sending…' : 'Send Reset Link'}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              <Link to="/login" className="text-orange-500 font-medium hover:underline flex items-center justify-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
