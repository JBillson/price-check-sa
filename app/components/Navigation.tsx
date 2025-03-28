'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '../../lib/utils';
import { useSession } from 'next-auth/react';

export function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link
              href="/"
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === '/' ? 'text-primary' : 'text-muted-foreground'
              )}
            >
              Home
            </Link>
            {session?.user?.email === 'justinbillson@gmail.com' && (
              <Link
                href="/admin/fetch"
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === '/admin/fetch' ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                Fetch Data
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 