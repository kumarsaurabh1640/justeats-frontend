import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { profileApi } from '../../api/profile';
import { authApi } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronUp, Lock, User } from 'lucide-react';
import FormField from '../../components/ui/FormField';

const profileSchema = yup.object({
  full_name: yup.string().max(200, 'Max 200 characters'),
  phone: yup.string().max(20, 'Max 20 characters'),
  bio: yup.string().max(1000, 'Max 1000 characters'),
});

const passwordSchema = yup.object({
  current_password: yup.string().required('Current password is required'),
  new_password: yup.string().min(8, 'At least 8 characters').required('New password is required'),
  confirm_password: yup
    .string()
    .oneOf([yup.ref('new_password')], 'Passwords must match')
    .required('Please confirm password'),
});

const inputCls =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent';

export default function Profile() {
  const { user } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({ resolver: yupResolver(profileSchema) });

  const {
    register: registerPwd,
    handleSubmit: handlePwdSubmit,
    reset: resetPwd,
    formState: { errors: pwdErrors, isSubmitting: isChangingPwd },
  } = useForm({ resolver: yupResolver(passwordSchema) });

  useEffect(() => {
    profileApi
      .getOwner()
      .then(({ data }) => reset(data))
      .catch(() => toast.error('Failed to load profile'));
  }, [reset]);

  const onSubmit = async (values) => {
    try {
      const { data } = await profileApi.updateOwner(values);
      reset(data);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const onChangePassword = async ({ current_password, new_password }) => {
    try {
      await authApi.changePassword(current_password, new_password);
      toast.success('Password changed successfully!');
      resetPwd();
      setShowPasswordForm(false);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
        <User className="w-6 h-6 text-orange-500" /> My Profile
      </h1>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Personal Information</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email">
            <input
              value={user?.email ?? ''}
              readOnly
              className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`}
            />
          </FormField>

          <FormField label="Full Name" error={errors.full_name?.message}>
            <input {...register('full_name')} placeholder="John Smith" className={inputCls} />
          </FormField>

          <FormField label="Phone" error={errors.phone?.message}>
            <input {...register('phone')} placeholder="+44 7700 000000" className={inputCls} />
          </FormField>

          <FormField label="Bio" error={errors.bio?.message}>
            <textarea
              {...register('bio')}
              rows={4}
              placeholder="Tell customers a little about yourself as a restaurant owner..."
              className={`${inputCls} resize-none`}
            />
          </FormField>

          <button
            type="submit"
            disabled={isSubmitting || !isDirty}
            className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-medium hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowPasswordForm((v) => !v)}
          className="w-full p-5 flex items-center justify-between hover:bg-gray-50"
        >
          <span className="flex items-center gap-2 font-semibold text-gray-800">
            <Lock className="w-4 h-4 text-orange-500" /> Change Password
          </span>
          {showPasswordForm ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {showPasswordForm && (
          <form onSubmit={handlePwdSubmit(onChangePassword)} className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
            <FormField label="Current Password" error={pwdErrors.current_password?.message}>
              <input {...registerPwd('current_password')} type="password" placeholder="........" className={inputCls} />
            </FormField>
            <FormField label="New Password" error={pwdErrors.new_password?.message}>
              <input {...registerPwd('new_password')} type="password" placeholder="Min. 8 characters" className={inputCls} />
            </FormField>
            <FormField label="Confirm New Password" error={pwdErrors.confirm_password?.message}>
              <input {...registerPwd('confirm_password')} type="password" placeholder="........" className={inputCls} />
            </FormField>
            <button
              type="submit"
              disabled={isChangingPwd}
              className="w-full bg-gray-800 text-white py-2.5 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-60 transition-colors"
            >
              {isChangingPwd ? 'Changing...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
