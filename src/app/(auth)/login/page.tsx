import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Sign in',
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
        <p className="text-sm text-muted">Sign in to access orders, saved addresses, and personalized picks.</p>
      </div>
      <LoginForm />
      <div className="text-center text-sm text-muted">
        <p>
          <Link href="/reset-password-request" className="font-semibold text-brand hover:underline">
            Forgot your password?
          </Link>
        </p>
        <p className="mt-2">
          New to ShopVerse?{' '}
          <Link href="/register" className="font-semibold text-brand hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
