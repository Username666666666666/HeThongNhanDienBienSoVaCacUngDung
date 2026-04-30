import { ReactNode, useEffect, useState } from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '../utils/supabase';

interface NguoiDung {
  manguoidung: string;
  chucnang: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
}: {
  children?: ReactNode;
  allowedRoles?: string[];
}) => {
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [redirectToLogin, setRedirectToLogin] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let channel: any; // TODO: Replace with proper Subscription type

    // 🔥 KICK ALL TAB
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'force_logout') {
        setRedirectToLogin(true);
      }
    };
    window.addEventListener('storage', handleStorage);

    // 🔥 LISTEN SIGN OUT
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        setRedirectToLogin(true);
      }
    });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const userId = session.user.id;

      // 🔥 GET ROLE
      const { data, error } = await supabase
        .from('nguoidung')
        .select('manguoidung, chucnang')
        .eq('manguoidung', userId)
        .single();

      if (error) {
        // Handle role fetch error silently
      }

      const role = (data as NguoiDung | null)?.chucnang || null;
      setUserRole(role);
      setLoading(false);

      // 🔥 REALTIME WATCH
      channel = supabase
        .channel('nguoidung-watch')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'nguoidung',
          },
          (payload: any) => {
            const newData = payload.new as NguoiDung;

            if (newData?.manguoidung === userId) {
              setUserRole((oldRole) => {
                if (oldRole && newData.chucnang !== oldRole) {
                  // logout tất cả
                  supabase.auth.signOut();

                  // broadcast sang tab khác
                  localStorage.setItem('force_logout', Date.now().toString());

                  // redirect
                  setRedirectToLogin(true);
                  return null;
                }

                return newData.chucnang;
              });
            }
          }
        )
        .subscribe((status: string, err: any) => {
  // Handle realtime subscription status
  if (status === "CHANNEL_ERROR") {
    // Handle realtime error
  }

  if (status === "TIMED_OUT") {
    // Handle realtime timeout
  }
});
    };

    init();

    return () => {
      if (channel) supabase.removeChannel(channel);
      window.removeEventListener('storage', handleStorage);
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Đang xác thực...</div>;

  if (redirectToLogin) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!userRole)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/not-found" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};