import { Suspense } from 'react';
import { PasswordResetForm } from '@/components/auth/PasswordResetForm';

export const metadata = {
  title: 'Update password',
};

export default function ResetPasswordPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Choose a new password</h1>
        <p className="text-sm text-muted">Paste the token from your email to confirm this change.</p>
      </div>
      <Suspense fallback={<div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-muted">Loading reset form…</div>}>
        <PasswordResetForm />
      </Suspense>
    </div>
  );
}
