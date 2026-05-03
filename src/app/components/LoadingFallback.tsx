export const LoadingFallback = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="rounded-3xl bg-white shadow-xl border border-slate-200 p-10 text-center max-w-sm w-full">
        <div className="mx-auto mb-6 h-14 w-14 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <h2 className="text-xl font-semibold text-slate-900 mb-2">Đang tải ứng dụng...</h2>
        <p className="text-sm text-slate-600">Xin chờ trong giây lát để hệ thống khởi tạo.</p>
      </div>
    </div>
  );
};
