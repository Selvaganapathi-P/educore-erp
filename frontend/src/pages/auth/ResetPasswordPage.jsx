import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../lib/axios';

export default function ResetPasswordPage() {
  const navigate  = useNavigate();
  const [params]  = useSearchParams();
  const token     = params.get('token') || '';
  const [showPwd, setShowPwd] = useState(false);
  const [done, setDone]       = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ password, confirmPassword }) => {
    setApiError('');
    try {
      await api.post('/auth/reset-password', { token, password, confirmPassword });
      setDone(true);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  if (!token) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-slate-500 mb-4">Invalid or missing reset token.</p>
        <Link to="/forgot-password" className="btn-primary">Request a new link</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900">EduCore ERP</span>
        </div>

        {done ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Password reset!</h1>
            <p className="text-sm text-slate-500">Redirecting you to sign in…</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Set new password</h1>
            <p className="text-sm text-slate-500 mb-8">Choose a strong password for your account.</p>

            {apiError && (
              <div className="alert-danger mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">New password</label>
                <div className="relative">
                  <input
                    type={showPwd ? 'text' : 'password'}
                    placeholder="••••••••"
                    className={clsx('input pr-10', errors.password && 'input-error')}
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 8, message: 'Minimum 8 characters' },
                      pattern: {
                        value: /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[^A-Za-z0-9])/,
                        message: 'Must include uppercase, lowercase, number, and special character',
                      },
                    })}
                  />
                  <button type="button" onClick={() => setShowPwd((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600" tabIndex={-1}>
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="field-error">{errors.password.message}</p>}
              </div>

              <div>
                <label className="label">Confirm password</label>
                <input
                  type={showPwd ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={clsx('input', errors.confirmPassword && 'input-error')}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === watch('password') || 'Passwords do not match',
                  })}
                />
                {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full mt-2">
                {isSubmitting ? 'Resetting…' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
