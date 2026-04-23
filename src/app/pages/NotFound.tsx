import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="text-6xl mb-4">🚗</div>
        <h1 className="text-4xl text-gray-900 mb-2">404</h1>
        <h2 className="text-xl text-gray-700 mb-4">Không tìm thấy trang</h2>
        <p className="text-gray-600 mb-6">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Trang chủ
          </button>
        </div>
      </div>
    </div>
  );
};
