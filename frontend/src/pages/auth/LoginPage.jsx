import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, GraduationCap, AlertCircle } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { clsx } from 'clsx';

export default function LoginPage() {
  const navigate  = useNavigate();
  const login     = useAuthStore((s) => s.login);
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState('');

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: '', password: '', rememberMe: false },
  });

  const onSubmit = async (values) => {
    setApiError('');
    try {
      const result = await login(values.email, values.password, values.rememberMe);
      const role   = result.user.role;
      navigate(role === 'super_admin' ? '/super-admin' : '/', { replace: true });
    } catch (err) {
      setApiError(err.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-primary-700 p-10 text-white">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">EduCore ERP</span>
        </div>

        <div>
          <blockquote className="text-2xl font-medium leading-snug text-balance mb-6">
            "The most complete school management platform we've ever used."
          </blockquote>
          <p className="text-primary-300 text-sm">— Principal, Delhi Public School</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Schools', value: '1,200+' },
            { label: 'Students managed', value: '5,40,000' },
            { label: 'Modules', value: '20' },
            { label: 'Uptime', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label} className="bg-white/10 rounded-lg p-4">
              <p className="text-xl font-bold tabular-nums">{stat.value}</p>
              <p className="text-xs text-primary-300 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900">EduCore ERP</span>
          </div>

          <h1 className="text-2xl font-semibold text-slate-900 mb-1">Welcome back</h1>
          <p className="text-sm text-slate-500 mb-8">Sign in to your account to continue</p>

          {apiError && (
            <div className="alert-danger mb-5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@school.edu"
                className={clsx('input', errors.email && 'input-error')}
                {...register('email', {
                  required: 'Email is required',
                  pattern:  { value: /\S+@\S+\.\S+/, message: 'Invalid email address' },
                })}
              />
              {errors.email && <p className="field-error">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="password" className="label mb-0">Password</label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className={clsx('input pr-10', errors.password && 'input-error')}
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  tabIndex={-1}
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="field-error">{errors.password.message}</p>}
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 cursor-pointer"
                {...register('rememberMe')}
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-600 cursor-pointer select-none">
                Keep me signed in for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </span>
              ) : 'Sign in'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Need help?{' '}
            <a href="mailto:support@educore.app" className="text-primary-600 hover:text-primary-700">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
