import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="auth-page">
      <div className="relative z-10 w-full max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
}