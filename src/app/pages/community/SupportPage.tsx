import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Coins, User, Shield, FileText, HelpCircle, MessageSquare, Search, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

type SupportCategory = 'coin' | 'account' | 'security' | 'technical' | 'other';

interface SupportPost {
  id: string;
  authorName: string;
  category: SupportCategory;
  title: string;
  content: string;
  createdAt: Date;
  replies: number;
  status: 'open' | 'answered' | 'closed';
}

export const SupportPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const communityCode = searchParams.get('code');
  const [selectedCategory, setSelectedCategory] = useState<SupportCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<SupportCategory>('other');

  const categories = [
    { value: 'coin' as const, label: 'Xu ảo', icon: Coins, color: 'yellow' },
    { value: 'account' as const, label: 'Tài khoản', icon: User, color: 'blue' },
    { value: 'security' as const, label: 'Bảo mật', icon: Shield, color: 'red' },
    { value: 'technical' as const, label: 'Kỹ thuật', icon: FileText, color: 'purple' },
    { value: 'other' as const, label: 'Khác', icon: HelpCircle, color: 'gray' },
  ];

  const [posts, setPosts] = useState<SupportPost[]>([
    {
      id: '1',
      authorName: 'Nguyễn Văn A',
      category: 'coin',
      title: 'Không nhận được xu sau khi nạp',
      content: 'Tôi đã nạp 100k nhưng chưa thấy xu vào tài khoản. Mã giao dịch: TXN123456',
      createdAt: new Date('2026-04-14T10:00:00'),
      replies: 3,
      status: 'answered',
    },
    {
      id: '2',
      authorName: 'Trần Thị B',
      category: 'security',
      title: 'Làm sao để đổi mật khẩu?',
      content: 'Tôi quên mật khẩu cũ, muốn đổi mật khẩu mới thì làm thế nào?',
      createdAt: new Date('2026-04-15T14:00:00'),
      replies: 1,
      status: 'open',
    },
  ]);

  const filteredPosts = posts.filter(post => {
    if (selectedCategory !== 'all' && post.category !== selectedCategory) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleCreateTicket = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const newPost: SupportPost = {
      id: `post${Date.now()}`,
      authorName: 'Bạn',
      category: newCategory,
      title: newTitle,
      content: newContent,
      createdAt: new Date(),
      replies: 0,
      status: 'open',
    };

    setPosts([newPost, ...posts]);
    setShowNewTicket(false);
    setNewTitle('');
    setNewContent('');
    setNewCategory('other');
    toast.success('Đã gửi yêu cầu hỗ trợ!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-700';
      case 'answered': return 'bg-blue-100 text-blue-700';
      case 'closed': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Đang chờ';
      case 'answered': return 'Đã trả lời';
      case 'closed': return 'Đã đóng';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/20 rounded-full transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl mb-2">Hỗ trợ khách hàng</h1>
              <p className="text-orange-100 text-sm">Đặt câu hỏi và nhận hỗ trợ từ cộng đồng</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Danh mục</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`w-full flex items-center gap-2 p-3 rounded-lg transition ${
                    selectedCategory === 'all'
                      ? 'bg-orange-100 text-orange-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="font-medium">Tất cả</span>
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`w-full flex items-center gap-2 p-3 rounded-lg transition ${
                      selectedCategory === cat.value
                        ? `bg-${cat.color}-100 text-${cat.color}-700`
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <cat.icon className="w-5 h-5" />
                    <span className="font-medium">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search & Create */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm câu hỏi..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowNewTicket(true)}
                  className="bg-gradient-to-r from-orange-600 to-amber-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Tạo yêu cầu
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có yêu cầu hỗ trợ nào</p>
                </div>
              ) : (
                filteredPosts.map((post) => {
                  const category = categories.find(c => c.value === post.category);
                  return (
                    <div key={post.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
                      <div className="flex items-start gap-4 mb-3">
                        <div className={`w-12 h-12 bg-${category?.color}-100 rounded-full flex items-center justify-center`}>
                          {category && <category.icon className={`w-6 h-6 text-${category.color}-600`} />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs px-3 py-1 rounded-full ${getStatusColor(post.status)}`}>
                              {getStatusText(post.status)}
                            </span>
                            <span className={`text-xs px-3 py-1 rounded-full bg-${category?.color}-100 text-${category?.color}-700`}>
                              {category?.label}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                          <p className="text-gray-600 mb-3">{post.content}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{post.authorName}</span>
                            <span>•</span>
                            <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                            <span>•</span>
                            <span>{post.replies} câu trả lời</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Ticket Modal */}
      {showNewTicket && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Tạo yêu cầu hỗ trợ</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as SupportCategory)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Mô tả ngắn gọn vấn đề"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nội dung chi tiết</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Mô tả chi tiết vấn đề bạn gặp phải..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewTicket(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateTicket}
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 text-white py-3 rounded-lg hover:shadow-lg transition"
              >
                Gửi yêu cầu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
