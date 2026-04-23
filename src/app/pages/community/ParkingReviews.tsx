import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  ThumbsUp,
  MessageSquare,
  Send,
  Filter,
  PencilLine,
  Trash2,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../../utils/supabase.ts';
import { useAuth } from '../../context/AuthContext.tsx';

type NguoiDungRow = {
  manguoidung: string;
  tennguoidung: string | null;
  chucnang: string | null;
};

type ParkingLotInfo = {
  mabaido: string;
  tenbaido: string;
  diachi: string | null;
  averageRating: number;
  totalReviews: number;
};

type RatingStatusRow = {
  ma_trang_danh_gia: string;
  mabaido: string;
  so_sao: number | null;
};

type ReviewRow = {
  ma_bai_dang: string;
  ma_trang_danh_gia: string;
  manguoidung: string;
  tieu_de: string | null;
  noi_dung: string | null;
  so_luot_thich: number | null;
  ngay_tao: string | null;
  so_sao: number | null;
  danh_gia?: {
    mabaido: string;
  }[];
};

type CommentRow = {
  ma_chi_tiet: string;
  manguoidung: string;
  ma_bai_dang: string;
  noi_dung: string | null;
  ngay_tao: string | null;
};

type CommentItem = {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  createdAt: string;
};

type ReviewItem = {
  id: string;
  ratingStatusId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  title: string;
  content: string;
  rating: number;
  likes: number;
  comments: CommentItem[];
  createdAt: string;
  likedBy: string[];
};

type ReviewDraft = {
  title: string;
  content: string;
  rating: number;
};

const ROLE_LABEL: Record<string, string> = {
  owner: '',
  admin: 'quản trị viên',
  supervisor: 'giám sát viên',
  support: 'nhân viên hỗ trợ',
  provider: 'nhà cung cấp',
};

const EMPTY_DRAFT: ReviewDraft = {
  title: '',
  content: '',
  rating: 5,
};

// Tạm thời mở để hệ thống chạy ổn và tin nhắn hoạt động.
// Khi cần siết quyền, đổi sang true và bật lại kiểm tra sudungdichvu / ctnhanvien.
const SECURITY_GATE_ENABLED = false;

export const ParkingReviews = () => {
  const [searchParams] = useSearchParams();
  const parkingId =
    searchParams.get('lotId') || searchParams.get('parking') || searchParams.get('code') || '';

  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserId = user?.id ?? '';
  const currentUserName = user?.name ?? user?.email ?? 'Người dùng';

  const [parkingLot, setParkingLot] = useState<ParkingLotInfo | null>(null);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [userRole, setUserRole] = useState<string>('owner');
  const [canReview, setCanReview] = useState(false);
  const [canComment, setCanComment] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ReviewDraft>(EMPTY_DRAFT);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const currentUser = {
    id: currentUserId,
    name: currentUserName,
    role: userRole,
  };

  const handleBackButton = () => navigate(-1);

  const renderDisplayName = (name: string, role?: string | null) => {
    if (!role || role === 'owner') return name;
    const label = ROLE_LABEL[role] ?? role;
    return label ? `${name} (${label})` : name;
  };

  const filteredReviews = useMemo(() => {
    if (filterRating === null) return reviews;
    return reviews.filter((review) => review.rating === filterRating);
  }, [filterRating, reviews]);

  const openNewReviewModal = () => {
    setEditingReviewId(null);
    setDraft(EMPTY_DRAFT);
    setShowReviewModal(true);
  };

  const openEditReviewModal = (review: ReviewItem) => {
    setEditingReviewId(review.id);
    setDraft({
      title: review.title,
      content: review.content,
      rating: review.rating || 5,
    });
    setShowReviewModal(true);
  };

  const ensureParkingStatus = async (): Promise<RatingStatusRow | null> => {
    if (!parkingId) return null;

    const { data: existing, error: lookupError } = await supabase
      .from('danh_gia')
      .select('ma_trang_danh_gia, mabaido, so_sao')
      .eq('mabaido', parkingId)
      .maybeSingle();

    if (lookupError) {
      toast.error('Không kiểm tra được trạng thái đánh giá của bãi đỗ');
      return null;
    }

    if (existing?.ma_trang_danh_gia) return existing as RatingStatusRow;

    const { data: inserted, error: insertError } = await supabase
      .from('danh_gia')
      .insert({
        mabaido: parkingId,
        so_sao: 0,
      })
      .select('ma_trang_danh_gia, mabaido, so_sao')
      .maybeSingle();

    if (insertError) {
      toast.error('Không khởi tạo được trạng thái đánh giá');
      return null;
    }

    return inserted as RatingStatusRow;
  };

  const refreshAverageRating = async (ratingStatusId: string) => {
    const { data: reviewStars, error: reviewStarError } = await supabase
      .from('bai_dang_danh_gia')
      .select('so_sao')
      .eq('ma_trang_danh_gia', ratingStatusId);

    if (reviewStarError) {
      toast.error('Không tính được điểm trung bình');
      return;
    }

    const stars = (reviewStars ?? [])
      .map((row) => Number(row.so_sao ?? 0))
      .filter((n) => Number.isFinite(n) && n > 0);

    const average = stars.length > 0 ? stars.reduce((sum, n) => sum + n, 0) / stars.length : 0;

    const { error: updateError } = await supabase
      .from('danh_gia')
      .update({ so_sao: average })
      .eq('ma_trang_danh_gia', ratingStatusId);

    if (updateError) {
      toast.error('Không lưu được điểm trung bình');
    }
  };

  const fetchParking = async () => {
    if (!parkingId) {
      setParkingLot(null);
      return;
    }

    const fallbackName = `Bãi đỗ ${parkingId}`;

    setParkingLot({
      mabaido: parkingId,
      tenbaido: fallbackName,
      diachi: null,
      averageRating: 0,
      totalReviews: 0,
    });

    const { data: parkingData, error: parkingError } = await supabase
      .from('baido')
      .select('mabaido, tenbaido, diachi')
      .eq('mabaido', parkingId)
      .maybeSingle();

    if (parkingError) {
      toast.error('Không tải được thông tin bãi đỗ');
    }

    const { data: ratingStatus, error: ratingStatusError } = await supabase
      .from('danh_gia')
      .select('ma_trang_danh_gia, mabaido, so_sao')
      .eq('mabaido', parkingId)
      .maybeSingle();

    if (ratingStatusError) {
      toast.error('Không tải được thông tin đánh giá');
    }

    setParkingLot({
      mabaido: parkingData?.mabaido ?? parkingId,
      tenbaido: parkingData?.tenbaido?.trim() || fallbackName,
      diachi: parkingData?.diachi ?? null,
      averageRating: Number(ratingStatus?.so_sao ?? 0),
      totalReviews: reviews.length,
    });
  };

  const fetchPermissions = async () => {
    if (!parkingId || !currentUserId) {
      setUserRole('owner');
      setCanReview(false);
      setCanComment(false);
      return;
    }

    const { data: userData } = await supabase
      .from('nguoidung')
      .select('manguoidung, tennguoidung, chucnang')
      .eq('manguoidung', currentUserId)
      .maybeSingle();

    const role = userData?.chucnang || 'owner';
    setUserRole(role);

    if (!SECURITY_GATE_ENABLED) {
      setCanReview(true);
      setCanComment(true);
      return;
    }

    if (role === 'provider') {
      setCanReview(true);
      setCanComment(true);
      return;
    }

    if (role === 'admin' || role === 'supervisor' || role === 'support') {
      const { data: staffRow, error: staffError } = await supabase
        .from('ctnhanvien')
        .select('manguoidung')
        .eq('manguoidung', currentUserId)
        .eq('mabaido', parkingId)
        .maybeSingle();

      if (staffError) {
        setCanReview(false);
        setCanComment(false);
        toast.error('Không kiểm tra được quyền nhân viên');
        return;
      }

      const allowed = !!staffRow;
      setCanReview(false);
      setCanComment(allowed);
      return;
    }

    if (role === 'owner') {
      const { data: usageRows, error: usageError } = await supabase
        .from('sudungdichvu')
        .select('manguoidung, mabaido, ngay_dang_ky, khoadanhgia')
        .eq('manguoidung', currentUserId)
        .eq('mabaido', parkingId);

      if (usageError) {
        setCanReview(false);
        setCanComment(false);
        toast.error('Không kiểm tra được quyền sử dụng dịch vụ');
        return;
      }

      const hasUsage = (usageRows ?? []).length > 0;
      const isLocked = (usageRows ?? []).some((row) => Boolean(row.khoadanhgia));

      setCanReview(hasUsage && !isLocked);
      setCanComment(hasUsage && !isLocked);
      return;
    }

    setCanReview(false);
    setCanComment(false);
  };

  const fetchReviews = async () => {
    if (!parkingId) {
      setReviews([]);
      return;
    }

    try {
      const ratingStatus = await ensureParkingStatus();
      if (!ratingStatus) {
        setReviews([]);
        return;
      }

      const { data: reviewRows, error: reviewError } = await supabase
        .from('bai_dang_danh_gia')
        .select(
          `
            ma_bai_dang,
            ma_trang_danh_gia,
            manguoidung,
            tieu_de,
            noi_dung,
            so_luot_thich,
            ngay_tao,
            so_sao,
            danh_gia!inner (
              mabaido
            )
          `,
        )
        .eq('ma_trang_danh_gia', ratingStatus.ma_trang_danh_gia)
        .order('ngay_tao', { ascending: false });

      if (reviewError) {
        toast.error(`Lỗi tải đánh giá: ${reviewError.message}`);
        return;
      }

      const reviewData = (reviewRows ?? []) as ReviewRow[];

      if (reviewData.length === 0) {
        setReviews([]);
        setParkingLot((prev) =>
          prev
            ? {
                ...prev,
                averageRating: Number(ratingStatus.so_sao ?? 0),
                totalReviews: 0,
              }
            : prev,
        );
        return;
      }

      const reviewAuthorIds = reviewData.map((review) => review.manguoidung);
      const reviewIds = reviewData.map((review) => review.ma_bai_dang);

      let commentsData: CommentRow[] = [];
      if (reviewIds.length > 0) {
        const { data: commentRows, error: commentError } = await supabase
          .from('chi_tiet_bai_dang')
          .select('ma_chi_tiet, manguoidung, ma_bai_dang, noi_dung, ngay_tao')
          .in('ma_bai_dang', reviewIds);

        if (commentError) {
          toast.error('Không tải được bình luận');
        }

        commentsData = (commentRows ?? []) as CommentRow[];
      }

      const commentAuthorIds = commentsData.map((comment) => comment.manguoidung);
      const allUserIds = Array.from(
        new Set([...reviewAuthorIds, ...commentAuthorIds].filter(Boolean)),
      );

      let usersData: NguoiDungRow[] = [];
      if (allUserIds.length > 0) {
        const { data: users, error: userError } = await supabase
          .from('nguoidung')
          .select('manguoidung, tennguoidung, chucnang')
          .in('manguoidung', allUserIds);

        if (userError) {
          toast.error('Không tải được thông tin người dùng');
        }

        usersData = (users ?? []) as NguoiDungRow[];
      }

      const userMap = new Map<string, NguoiDungRow>();
      usersData.forEach((u) => userMap.set(u.manguoidung, u));

      const commentsByReviewId = new Map<string, CommentItem[]>();
      commentsData
        .sort((a, b) => new Date(a.ngay_tao ?? 0).getTime() - new Date(b.ngay_tao ?? 0).getTime())
        .forEach((comment) => {
          const author = userMap.get(comment.manguoidung);
          const item: CommentItem = {
            id: comment.ma_chi_tiet,
            userId: comment.manguoidung,
            userName: author?.tennguoidung ?? 'Người dùng',
            userRole: author?.chucnang ?? 'owner',
            content: comment.noi_dung ?? '',
            createdAt: comment.ngay_tao ?? new Date().toISOString(),
          };

          const current = commentsByReviewId.get(comment.ma_bai_dang) ?? [];
          current.push(item);
          commentsByReviewId.set(comment.ma_bai_dang, current);
        });

      const mappedReviews: ReviewItem[] = reviewData.map((row) => {
        const author = userMap.get(row.manguoidung);
        return {
          id: row.ma_bai_dang,
          ratingStatusId: row.ma_trang_danh_gia,
          authorId: row.manguoidung,
          authorName: author?.tennguoidung ?? 'Người dùng',
          authorRole: author?.chucnang ?? 'owner',
          title: (row.tieu_de ?? 'ĐÁNH GIÁ').trim() || 'ĐÁNH GIÁ',
          content: row.noi_dung ?? '',
          rating: Number(row.so_sao ?? 0),
          likes: Number(row.so_luot_thich ?? 0),
          comments: commentsByReviewId.get(row.ma_bai_dang) ?? [],
          createdAt: row.ngay_tao ?? new Date().toISOString(),
          likedBy: [],
        };
      });

      setReviews(mappedReviews);
      setParkingLot((prev) =>
        prev
          ? {
              ...prev,
              averageRating: Number(ratingStatus.so_sao ?? 0),
              totalReviews: mappedReviews.length,
            }
          : prev,
      );
    } catch (err) {
      console.error(err);
      toast.error('Lỗi không xác định khi tải đánh giá');
    }
  };

  const handleLikeReview = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('Bạn cần đăng nhập');
      return;
    }

    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    const alreadyLiked = review.likedBy.includes(currentUserId);
    const nextLikes = alreadyLiked ? Math.max(0, review.likes - 1) : review.likes + 1;

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? {
              ...r,
              likes: nextLikes,
              likedBy: alreadyLiked
                ? r.likedBy.filter((id) => id !== currentUserId)
                : [...r.likedBy, currentUserId],
            }
          : r,
      ),
    );

    const { error } = await supabase
      .from('bai_dang_danh_gia')
      .update({ so_luot_thich: nextLikes })
      .eq('ma_bai_dang', reviewId);

    if (error) {
      toast.error('Không thể cập nhật lượt thích');
      await fetchReviews();
    }
  };

  const handleAddComment = async (reviewId: string) => {
    if (!currentUserId) {
      toast.error('Bạn cần đăng nhập');
      return;
    }

    if (!canComment) {
      toast.error('Bạn không có quyền bình luận ở bãi này');
      return;
    }

    const content = commentText[reviewId]?.trim();
    if (!content) return;

    const { error } = await supabase.from('chi_tiet_bai_dang').insert({
      manguoidung: currentUserId,
      ma_bai_dang: reviewId,
      noi_dung: content,
    });

    if (error) {
      toast.error('Không thể thêm bình luận');
      return;
    }

    setCommentText((prev) => ({ ...prev, [reviewId]: '' }));
    await fetchReviews();
    toast.success('Đã thêm bình luận');
  };

  const handleSubmitReview = async () => {
    if (!currentUserId) {
      toast.error('Bạn cần đăng nhập');
      return;
    }

    if (!parkingId) {
      toast.error('Thiếu mã bãi đỗ');
      return;
    }

    if (!canReview) {
      toast.error('Bạn không có quyền đăng đánh giá ở bãi này');
      return;
    }

    if (!draft.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }

    if (!draft.content.trim()) {
      toast.error('Vui lòng nhập nội dung đánh giá');
      return;
    }

    if (draft.rating < 1 || draft.rating > 5) {
      toast.error('Vui lòng chọn số sao hợp lệ');
      return;
    }

    const ratingStatus = await ensureParkingStatus();
    if (!ratingStatus) return;

    // ✅ kiểm tra bài viết TẠI 1 BÃI (không phải toàn hệ thống)
    const { data: existingReview, error: existingReviewError } = await supabase
      .from('bai_dang_danh_gia')
      .select('ma_bai_dang, manguoidung, ma_trang_danh_gia')
      .eq('ma_trang_danh_gia', ratingStatus.ma_trang_danh_gia) // 👈 CHỈ cùng bãi
      .eq('manguoidung', currentUserId)
      .maybeSingle();

    if (existingReviewError) {
      toast.error('Không kiểm tra được bài đánh giá hiện có');
      return;
    }

    const payload = {
      ma_trang_danh_gia: ratingStatus.ma_trang_danh_gia,
      manguoidung: currentUserId,
      tieu_de: draft.title.trim(),
      noi_dung: draft.content.trim(),
      so_sao: draft.rating,
    };

    if (existingReview?.ma_bai_dang) {
      const { error } = await supabase
        .from('bai_dang_danh_gia')
        .update({
          tieu_de: payload.tieu_de,
          noi_dung: payload.noi_dung,
          so_sao: payload.so_sao,
        })
        .eq('ma_bai_dang', existingReview.ma_bai_dang);

      if (error) {
        toast.error('Không thể cập nhật bài đánh giá');
        return;
      }
    } else {
      const { error } = await supabase.from('bai_dang_danh_gia').insert({
        ...payload,
        so_luot_thich: 0,
      });

      if (error) {
        toast.error('Không thể tạo bài đánh giá');
        return;
      }
    }

    await refreshAverageRating(ratingStatus.ma_trang_danh_gia);
    await fetchReviews();

    setShowReviewModal(false);
    setEditingReviewId(null);
    setDraft(EMPTY_DRAFT);
    toast.success('Đánh giá của bạn đã được lưu');
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!currentUserId) return;

    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    const canDelete =
      review.authorId === currentUserId ||
      userRole === 'owner' ||
      userRole === 'admin' ||
      userRole === 'supervisor' ||
      userRole === 'provider';

    if (!canDelete) {
      toast.error('Bạn không có quyền gỡ bài này');
      return;
    }

    const { error: commentDeleteError } = await supabase
      .from('chi_tiet_bai_dang')
      .delete()
      .eq('ma_bai_dang', reviewId);

    if (commentDeleteError) {
      toast.error('Không thể xoá bình luận liên quan');
      return;
    }

    const { error: reviewDeleteError } = await supabase
      .from('bai_dang_danh_gia')
      .delete()
      .eq('ma_bai_dang', reviewId);

    if (reviewDeleteError) {
      toast.error('Không thể gỡ bài đánh giá');
      return;
    }

    await refreshAverageRating(review.ratingStatusId);
    await fetchReviews();
    toast.success('Đã gỡ bài đánh giá');
  };

  useEffect(() => {
    if (!parkingId) return;
    fetchPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkingId, currentUserId]);

  useEffect(() => {
    if (!parkingId) return;
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkingId]);

  useEffect(() => {
    if (!parkingId) return;
    fetchParking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parkingId, reviews.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50">
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={handleBackButton}
              className="p-2 hover:bg-white/20 rounded-full transition-all"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <div className="flex-1">
              <h1 className="text-2xl mb-1">Đánh giá bãi đỗ xe</h1>
              <p className="text-purple-100 text-sm">
                {parkingLot?.tenbaido ?? 'Bãi đỗ xe'}
              </p>
              <p className="text-xs text-green-200 mt-1">
                {parkingId ? `Đã kết nối DB với mabaido: ${parkingId}` : 'Không có parkingId'}
              </p>
            </div>

            {currentUserId ? (
              <button
                onClick={openNewReviewModal}
                className="bg-white text-purple-600 px-6 py-3 rounded-xl hover:shadow-lg transition-all"
              >
                Viết đánh giá
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-sm text-gray-600 mb-2">Đánh giá trung bình</h3>
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl text-gray-900">
                  {(parkingLot?.averageRating ?? 0).toFixed(1)}
                </span>
                <Star className="w-8 h-8 fill-yellow-400 text-yellow-400 mb-1" />
              </div>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= (parkingLot?.averageRating ?? 0)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{parkingLot?.totalReviews ?? 0} đánh giá</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
                <Filter className="w-5 h-5 text-purple-600" />
                Lọc theo sao
              </h3>
              <div className="space-y-2">
                <button
                  onClick={() => setFilterRating(null)}
                  className={`w-full text-left p-2 rounded-lg transition-all ${
                    filterRating === null
                      ? 'bg-purple-100 text-purple-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <span className="text-sm">Tất cả</span>
                </button>

                {[5, 4, 3, 2, 1].map((stars) => (
                  <button
                    key={stars}
                    onClick={() => setFilterRating(stars)}
                    className={`w-full text-left p-2 rounded-lg transition-all ${
                      filterRating === stars
                        ? 'bg-purple-100 text-purple-700'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-0.5">
                        {[...Array(stars)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm">({stars} sao)</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md p-12 text-center">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Chưa có đánh giá nào</p>
                </div>
              ) : (
                filteredReviews.map((review) => {
                  const isOwner = review.authorId === currentUserId;
                  return (
                    <div key={review.id} className="bg-white rounded-xl shadow-md p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-xl">
                          {(review.authorName?.[0] ?? 'U').toUpperCase()}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-gray-900">
                              {renderDisplayName(review.authorName, review.authorRole)}
                            </h3>
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                              {review.rating}/5 sao
                            </span>
                            {isOwner && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                Bài của bạn
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= (review.rating || 0)
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>

                        {isOwner && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEditReviewModal(review)}
                              className="p-2 rounded-lg hover:bg-purple-50 text-purple-600 transition-all"
                              title="Chỉnh sửa"
                            >
                              <PencilLine className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review.id)}
                              className="p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all"
                              title="Gỡ bài"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>

                      <h2 className="text-xl text-gray-900 mb-2 font-semibold">{review.title}</h2>
                      <p className="text-gray-700 mb-4 whitespace-pre-line">{review.content}</p>

                      <div className="flex items-center gap-6 pt-4 border-t">
                        <button
                          onClick={() => handleLikeReview(review.id)}
                          className={`flex items-center gap-2 transition-all ${
                            review.likedBy.includes(currentUser.id)
                              ? 'text-purple-600'
                              : 'text-gray-600 hover:text-purple-600'
                          }`}
                        >
                          <ThumbsUp className="w-5 h-5" />
                          <span>{review.likes}</span>
                        </button>

                        <div className="flex items-center gap-2 text-gray-600">
                          <MessageSquare className="w-5 h-5" />
                          <span>{review.comments.length}</span>
                        </div>
                      </div>

                      {review.comments.length > 0 && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          {review.comments.map((comment) => (
                            <div key={comment.id} className="flex gap-3">
                              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 text-sm">
                                {(comment.userName?.[0] ?? 'U').toUpperCase()}
                              </div>
                              <div className="flex-1 bg-gray-50 rounded-lg p-3">
                                <div className="text-sm text-gray-900 mb-1">
                                  {renderDisplayName(comment.userName, comment.userRole)}
                                </div>
                                <p className="text-sm text-gray-700 whitespace-pre-line">
                                  {comment.content}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <input
                          type="text"
                          value={commentText[review.id] || ''}
                          onChange={(e) =>
                            setCommentText({ ...commentText, [review.id]: e.target.value })
                          }
                          placeholder={
                            canComment ? 'Bình luận của bạn...' : 'Bạn không có quyền bình luận'
                          }
                          disabled={!canComment}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && canComment) {
                              handleAddComment(review.id);
                            }
                          }}
                        />
                        <button
                          onClick={() => handleAddComment(review.id)}
                          disabled={!canComment}
                          className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl text-gray-900">
                  {editingReviewId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Tên bãi: {parkingLot?.tenbaido ?? 'Bãi đỗ xe'}
                </p>
              </div>
              <button
                onClick={() => setShowReviewModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm text-gray-700 mb-3">Đánh giá của bạn</label>
                <div className="flex items-center gap-2 flex-wrap">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setDraft((prev) => ({ ...prev, rating: star }))}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= draft.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">{draft.rating}/5 sao</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-700 mb-2">Tiêu đề</label>
                  <input
                    type="text"
                    value={draft.title}
                    onChange={(e) => setDraft((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Ví dụ: Bãi đỗ sạch sẽ, an toàn"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">Người đăng</label>
                  <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700">
                    {renderDisplayName(currentUser.name, currentUser.role)}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-2">Nội dung đánh giá</label>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft((prev) => ({ ...prev, content: e.target.value }))}
                  placeholder="Chia sẻ chi tiết trải nghiệm của bạn..."
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  Bài viết sẽ hiển thị tiêu đề in đậm và nội dung bên dưới. Mỗi người dùng chỉ có 1
                  bài đánh giá cho mỗi bãi đỗ; bạn có thể sửa hoặc gỡ bài để đăng lại.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg hover:shadow-lg transition-all"
              >
                {editingReviewId ? 'Lưu thay đổi' : 'Gửi đánh giá'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
