// components/providers/AdminProvider.js
'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

const AdminContext = createContext({});

export function AdminProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && localStorage.getItem('adminAuth')) {
        setAdmin(user);
      } else {
        setAdmin(null);
        // Redirect to login if not on login page
        if (pathname !== '/admin/login') {
          router.push('/admin/login');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, router]);

  return (
    <AdminContext.Provider value={{ admin, loading }}>
      {!loading && children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);