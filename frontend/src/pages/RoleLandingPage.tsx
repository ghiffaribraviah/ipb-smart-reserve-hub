import { useLocation } from 'react-router';

import type { CurrentUser, UserRole } from '../features/auth/api';

type RoleLandingPageProps = {
  role: UserRole;
  title: string;
};

export function RoleLandingPage({ role, title }: RoleLandingPageProps) {
  const location = useLocation();
  const currentUser = (location.state as { currentUser?: CurrentUser } | null)?.currentUser;

  return (
    <main className="min-h-screen bg-surface px-6 py-10 text-primary">
      <div className="mx-auto max-w-4xl rounded-2xl border border-outline-variant bg-surface-container-lowest p-8 shadow-emerald-sm">
        <p className="text-sm font-bold uppercase tracking-normal text-secondary">{role.replace('_', ' ')}</p>
        <h1 className="mt-3 text-3xl font-bold tracking-normal">{title}</h1>
        <p className="mt-4 text-on-surface-variant">
          {currentUser ? currentUser.email : 'Authenticated role landing placeholder.'}
        </p>
      </div>
    </main>
  );
}
