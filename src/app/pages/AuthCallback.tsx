import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase.ts';

export const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate('/login');
        return;
      }

      const userId = session.user.id;

      const { data, error } = await supabase
        .from('nguoidung')
        .select('chucnang')
        .eq('manguoidung', userId)
        .maybeSingle();

      // 👉 chưa có thì tạo mới
      if (!data) {
        await supabase.from('nguoidung').insert({
          manguoidung: userId,
          email: session.user.email,
          chucnang: 'owner',
        });

        navigate('/owner');
        return;
      }

      // 👉 có rồi thì đi đúng role
      navigate(`/${data.chucnang}`);
    };

    handleUser();
  }, []);

  return <div>Đang đăng nhập Google...</div>;
};