import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { GraduationCap, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import api from '../../lib/axios';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async ({ email }) => {
    setApiError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-slate-900">EduCore ERP</span>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="w-12 h-12 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-6 h-6 text-success-600" />
            </div>
            <h1 className="text-xl font-semibold text-slate-900 mb-2">Check your email</h1>
            <p className="text-sm text-slate-500 mb-6">
              If an account exists with that email, we've sent a password reset link. Check your inbox.
            </p>
            <Link to="/login" className="btn-primary w-full justify-center">
              Back to sign in
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">Reset your password</h1>
            <p className="text-sm text-slate-500 mb-8">
              Enter your email address and we'll send you a reset link.
            </p>

            {apiError && (
              <div className="alert-danger mb-5">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="label">Email address</label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@school.edu"
                  className={clsx('input', errors.email && 'input-error')}
                  {...register('email', {
                    required: 'Email is required',
                    pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email' },
                  })}
                />
                {errors.email && <p className="field-error">{errors.email.message}</p>}
              </div>

              <button type="submit" disabled={isSubmitting} className="btn-primary w-full">
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </button>
            </form>

            <Link
              to="/login"
              className="mt-6 flex items-center justify-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
