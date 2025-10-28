import { PasswordResetRequestForm } from '@/components/auth/PasswordResetRequestForm';

export const metadata = {
  title: 'Reset password',
};

export default function ResetPasswordRequestPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Forgot password</h1>
        <p className="text-sm text-muted">Enter your email and we’ll send instructions to reset your password.</p>
      </div>
      <PasswordResetRequestForm />
    </div>
  );
}
