import { useRouteError, useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';

export const ErrorBoundary = () => {
  const error = useRouteError() as any;
  const navigate = useNavigate();

  console.error('Route error:', error);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl text-gray-900 mb-2">Có lỗi xảy ra</h1>
        <p className="text-gray-600 mb-6">
          {error?.statusText || error?.message || 'Đã xảy ra lỗi không mong muốn'}
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
