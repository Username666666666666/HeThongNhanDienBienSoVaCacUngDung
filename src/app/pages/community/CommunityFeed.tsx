import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft, Plus, MessageSquare, ThumbsUp, Hash, AlertTriangle,
  Search, Filter, Bell, Gift, HelpCircle, Star, Users, Send, LogOut, Map
} from 'lucide-react';
import { toast } from 'sonner';
import type { CommunityPost, ContentTag } from '../../types/community.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { getHomeRoute } from '../../utils/navigation.ts';

export const CommunityFeed = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const communityCode = searchParams.get('code');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<ContentTag[]>([]);
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTags, setNewPostTags] = useState<ContentTag[]>([]);
  const [commentText, setCommentText] = useState<{ [key: string]: string }>({});

  // Mock data - Use actual user from auth
  const currentUser = {
    id: user?.id || 'user1',
    name: user?.name || 'Người dùng',
   role:
  user?.role === 'support' ? 'support' :
  user?.role === 'admin' ? 'admin' :
  user?.role === 'super_admin' ? 'super_admin' :
  'owner',
  };

  const parkingLot = {
    code: 'PL001',
    name: 'Bãi đỗ xe Trung tâm A',
    communityCode: 'COMM001',
  };

  const [posts, setPosts] = useState<CommunityPost[]>([
    {
      id: '1',
      authorId: 'user1',
      authorName: 'Nguyễn Văn A',
      parkingLotCode: 'PL001',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      tags: ['experience'],
      title: 'Trải nghiệm đỗ xe tuyệt vời',
      content: 'Bãi đỗ rất tốt, nhân viên nhiệt tình. Camera giám sát kỹ lưỡng, tôi rất yên tâm.',
      createdAt: new Date('2026-03-30T10:00:00'),
      status: 'approved',
      likes: 15,
      likedBy: [],
      comments: [
        {
          id: 'c1',
          userId: 'admin1',
          userName: 'Quản lý bãi A',
          content: 'Cảm ơn bạn đã tin tưởng sử dụng dịch vụ!',
          createdAt: new Date('2026-03-30T11:00:00'),
        },
      ],
      hasParkedHere: true,
    },
    {
      id: '2',
      authorId: 'admin1',
      authorName: 'Admin Bãi A',
      parkingLotCode: 'PL001',
      parkingLotName: 'Bãi đỗ xe Trung tâm A',
      tags: ['announcement', 'event'],
      title: 'Khuyến mãi tháng 4 - Giảm 20% phí đỗ xe',
      content: 'Nhân dịp kỷ niệm 1 năm thành lập, bãi đỗ giảm giá 20% cho tất cả khách hàng từ ngày 1-15/4!',
      createdAt: new Date('2026-03-29T15:00:00'),
      status: 'approved',
      likes: 42,
      likedBy: [],
      comments: [
        {
          id: 'c2',
          userId: 'user2',
          userName: 'Trần Thị B',
          content: 'Thông tin tuyệt vời! Cảm ơn admin',
          createdAt: new Date('2026-03-29T16:00:00'),
        },
      ],
      hasParkedHere: false,
    },
  ]);

  const allTags: { value: ContentTag; label: string; icon: any; adminOnly?: boolean }[] = [
    { value: 'announcement', label: 'Thông báo', icon: Bell, adminOnly: true },
    { value: 'event', label: 'Sự kiện', icon: Gift, adminOnly: true },
    { value: 'experience', label: 'Trải nghiệm', icon: MessageSquare },
    { value: 'general', label: 'Chung', icon: Hash },
  ];

  const availableTags = allTags.filter(
    tag => !tag.adminOnly || ['admin', 'super_admin'].includes(currentUser.role)
  );

  const filteredPosts = posts.filter(post => {
    if (selectedTags.length > 0 && !selectedTags.some(tag => post.tags.includes(tag))) return false;
    if (searchQuery && !post.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return post.status === 'approved';
  });

  const handleLikePost = (postId: string) => {
    setPosts(posts.map(p =>
      p.id === postId
        ? { ...p, likes: p.likedBy.includes(currentUser.id) ? p.likes - 1 : p.likes + 1, likedBy: p.likedBy.includes(currentUser.id) ? p.likedBy.filter(id => id !== currentUser.id) : [...p.likedBy, currentUser.id] }
        : p
    ));
  };

  const handleAddComment = (postId: string) => {
    const content = commentText[postId]?.trim();
    if (!content) return;

    setPosts(posts.map(p =>
      p.id === postId
        ? {
          ...p,
          comments: [
            ...p.comments,
            {
              id: `c${Date.now()}`,
              userId: currentUser.id,
              userName: currentUser.name,
              content,
              createdAt: new Date(),
            },
          ],
        }
        : p
    ));

    setCommentText({ ...commentText, [postId]: '' });
    toast.success('Đã thêm góp ý');
  };

  const handleCreatePost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (newPostTags.length === 0) {
      toast.error('Vui lòng chọn ít nhất 1 phân loại');
      return;
    }

    const newPost: CommunityPost = {
      id: `post${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      parkingLotCode: parkingLot.code,
      parkingLotName: parkingLot.name,
      tags: newPostTags,
      title: newPostTitle,
      content: newPostContent,
      createdAt: new Date(),
      status: 'pending',
      likes: 0,
      likedBy: [],
      comments: [],
      hasParkedHere: true,
    };

    setPosts([newPost, ...posts]);
    setShowNewPost(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags([]);
    toast.success('Bài đăng đang chờ kiểm duyệt');
  };

  if (!communityCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl text-gray-900 mb-2">Chưa có mã cộng đồng</h2>
          <p className="text-gray-600 mb-6">Vui lòng nhập mã cộng đồng để tiếp tục</p>
          <button
            onClick={() => navigate('/community')}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                localStorage.removeItem('communityCode');
                navigate('/community');
                toast.success('Đã rời khỏi cộng đồng');
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <LogOut className="w-6 h-6" />
            </button>
            <div className="flex-1">
              <h1 className="text-2xl mb-1">{parkingLot.name}</h1>
              <p className="text-purple-100 text-sm">Cộng đồng • Mã: {communityCode}</p>
            </div>
            <button
              onClick={() => navigate('/community/theft')}
              className="bg-red-500 hover:bg-red-600 px-4 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <AlertTriangle className="w-5 h-5" />
              Báo mất cắp
            </button>
            <button
              onClick={() => navigate('/community/support')}
              className="bg-orange-500 hover:bg-orange-600 px-4 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <HelpCircle className="w-5 h-5" />
              Hỗ trợ
            </button>
            <button
              onClick={() => navigate('/community/chat?code=' + communityCode)}
              className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition-all"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate(`/community/reviews?parking=${parkingLot.code}&from=feed&code=${communityCode}`)}
              className="bg-white/20 hover:bg-white/30 px-4 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              <Star className="w-5 h-5" />
              Đánh giá
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Filter Tags */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Phân loại
              </h3>
              <div className="space-y-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag.value}
                    onClick={() => {
                      if (selectedTags.includes(tag.value)) {
                        setSelectedTags(selectedTags.filter(t => t !== tag.value));
                      } else {
                        setSelectedTags([...selectedTags, tag.value]);
                      }
                    }}
                    className={`w-full flex items-center gap-2 p-2 rounded-lg transition-all ${
                      selectedTags.includes(tag.value)
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <tag.icon className="w-4 h-4" />
                    <span className="text-sm">{tag.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search & New Post */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm kiếm bài viết..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={() => setShowNewPost(true)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Đăng bài
                </button>
              </div>
            </div>

            {/* Posts */}
            <div className="space-y-4">
              {filteredPosts.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có bài viết nào</p>
                </div>
              ) : (
                filteredPosts.map((post) => (
                  <div key={post.id} className="bg-white rounded-xl shadow-md p-6">
                    {/* Post Header */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl">
                        {post.authorName[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-gray-900">{post.authorName}</h3>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex gap-2 mb-3">
                      {post.tags.map((tag) => {
                        const tagInfo = allTags.find(t => t.value === tag);
                        if (!tagInfo) return null;
                        return (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full"
                          >
                            <tagInfo.icon className="w-3 h-3" />
                            {tagInfo.label}
                          </span>
                        );
                      })}
                    </div>

                    {/* Post Content */}
                    <h2 className="text-xl text-gray-900 mb-2">{post.title}</h2>
                    <p className="text-gray-700 mb-4">{post.content}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-6 pt-4 border-t">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex items-center gap-2 transition-all ${
                          post.likedBy.includes(currentUser.id)
                            ? 'text-purple-600'
                            : 'text-gray-600 hover:text-purple-600'
                        }`}
                      >
                        <ThumbsUp className="w-5 h-5" />
                        <span>{post.likes}</span>
                      </button>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageSquare className="w-5 h-5" />
                        <span>{post.comments.length}</span>
                      </div>
                    </div>

                    {/* Comments */}
                    {post.comments.length > 0 && (
                      <div className="mt-4 pt-4 border-t space-y-3">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm">
                              {comment.userName[0]}
                            </div>
                            <div className="flex-1 bg-gray-50 rounded-lg p-3">
                              <div className="text-sm text-gray-900 mb-1">{comment.userName}</div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-4 flex gap-2">
                      <input
                        type="text"
                        value={commentText[post.id] || ''}
                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                        placeholder="Góp ý của bạn..."
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-all"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl text-gray-900">Tạo bài đăng mới</h2>
              <button
                onClick={() => setShowNewPost(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Tiêu đề</label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  placeholder="Nhập tiêu đề bài đăng"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Nội dung</label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn..."
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Phân loại</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag.value}
                      onClick={() => {
                        if (newPostTags.includes(tag.value)) {
                          setNewPostTags(newPostTags.filter(t => t !== tag.value));
                        } else {
                          setNewPostTags([...newPostTags, tag.value]);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                        newPostTags.includes(tag.value)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <tag.icon className="w-4 h-4" />
                      {tag.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Bài đăng của bạn sẽ được kiểm duyệt trước khi hiển thị công khai
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewPost(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreatePost}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
              >
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};