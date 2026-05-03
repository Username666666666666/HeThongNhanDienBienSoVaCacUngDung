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
        localStorage.clear(); // Xóa sạch dữ liệu cũ
        window.location.href = '/login';
      }
    };

    // 🔥 LISTEN SIGN OUT
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        localStorage.clear(); // Quan trọng: Xóa cache AuthContext
        window.location.href = '/login';
      }
      if (event === 'SIGNED_IN') {
         init();
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

const rawRole = (data as NguoiDung | null)?.chucnang || null;
const role = rawRole ? rawRole.trim().toLowerCase() : null;

// 🔥 1. CHẶN ĐI LẠC BASE URL (Ngăn support kẹt trong route /supervisor)
const currentPath = window.location.pathname;
if (role) {
  // Định nghĩa các khu vực mà mỗi role được phép đi vào
  const allowedBasePaths: Record<string, string[]> = {
    'owner': ['/owner'],
    'support': ['/support', '/owner'], // Support được vào trang của support VÀ owner
    'supervisor': ['/supervisor', '/owner'], // Supervisor được vào trang của supervisor VÀ owner
    'admin': ['/admin'],
    'provider': ['/provider'],
  };

  const roleAllowedPaths = allowedBasePaths[role] || [];
  const protectedPrefixes = ['/owner', '/support', '/supervisor', '/admin', '/provider'];

  // Xem URL hiện tại thuộc khu vực quản lý của ai
  const currentPrefix = protectedPrefixes.find(prefix => currentPath.startsWith(prefix));

  // Nếu URL hiện tại nằm trong vùng cấm, và role này không được cấp quyền vào vùng đó -> ĐÁ VĂNG
  if (currentPrefix && !roleAllowedPaths.includes(currentPrefix)) {
    console.log(`🚨 Chặn truy cập! Role '${role}' không được phép vào khu vực '${currentPrefix}'`);
    window.location.href = `/${role}`; // Ép reload về trang gốc của role đó
    return;
  }
}

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
  
  // Dọn rác
  localStorage.clear();
  localStorage.setItem('force_logout', Date.now().toString());

  // Logout từ Supabase
  supabase.auth.signOut().then(() => {
    // Ép reload chứ không chỉ navigate để reset toàn bộ React tree & AuthContext
    window.location.href = '/login'; 
  });

  return null;
}

               return newData.chucnang?.trim().toLowerCase() || null;
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