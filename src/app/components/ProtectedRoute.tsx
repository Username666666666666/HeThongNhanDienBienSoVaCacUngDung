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
  const location = useLocation();

  useEffect(() => {
    let channel: any;

    // 🔥 KICK ALL TAB
    const handleStorage = (event: StorageEvent) => {
      if (event.key === 'force_logout') {
        console.log("🔥 Logout từ tab khác");
        window.location.href = '/login';
      }
    };
    window.addEventListener('storage', handleStorage);

    // 🔥 LISTEN SIGN OUT
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        console.log("🔥 SIGNED OUT");
        window.location.href = '/login';
      }
    });

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      console.log("SESSION:", session);

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
        console.error("Lỗi lấy role:", error);
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
            console.log("🔥 REALTIME:", payload);

            const newData = payload.new as NguoiDung;

            if (newData?.manguoidung === userId) {
              setUserRole((oldRole) => {
                if (oldRole && newData.chucnang !== oldRole) {
                  console.log("🚨 ROLE CHANGED → KICK");

                  // logout tất cả
                  supabase.auth.signOut();

                  // broadcast sang tab khác
                  localStorage.setItem('force_logout', Date.now().toString());

                  // redirect
                  setTimeout(() => {
                    window.location.href = '/login';
                  }, 100);

                  return null;
                }

                return newData.chucnang;
              });
            }
          }
        )
        .subscribe((status: string, err: any) => {
  console.log("🔥 REALTIME STATUS:", status);

  if (status === "CHANNEL_ERROR") {
    console.error("❌ REALTIME ERROR:", err);
  }

  if (status === "TIMED_OUT") {
    console.error("⏱️ REALTIME TIMEOUT");
  }

  if (status === "SUBSCRIBED") {
    console.log("✅ REALTIME CONNECTED");
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

  if (!userRole)
    return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/not-found" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};