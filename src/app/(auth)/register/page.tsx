import Link from 'next/link';
import { RegisterForm } from '@/components/auth/RegisterForm';

export const metadata = {
  title: 'Create account',
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold text-slate-900">Join ShopVerse</h1>
        <p className="text-sm text-muted">Stay in sync with curated collections, wishlists, and order tracking.</p>
      </div>
      <RegisterForm />
      <p className="text-center text-sm text-muted">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
