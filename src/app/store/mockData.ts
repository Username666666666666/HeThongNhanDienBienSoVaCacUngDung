import { User, Vehicle, ParkingLot, ParkingSession, Transaction, CommunityPost, StealReport } from '../types';

// Demo users with virtual coins
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin Nguyễn',
    email: 'admin@parking.com',
    role: 'admin',
    virtualCoins: 5000,
    phone: '0901234567',
  },
  {
    id: '2',
    name: 'Giám sát Trần',
    email: 'supervisor@parking.com',
    role: 'supervisor',
    virtualCoins: 2000,
    phone: '0902345678',
  },
  {
    id: '3',
    name: 'Người dùng Lê',
    email: 'owner@parking.com',
    role: 'owner',
    virtualCoins: 1500,
    phone: '0903456789',
    cccd: '001234567890',
  },
];

// Demo vehicles
export const mockVehicles: Vehicle[] = [
  {
    id: 'v1',
    ownerId: '3',
    plateNumber: '30A-12345',
    vehicleType: 'car',
    status: 'parked',
    currentParkingLotId: 'p1',
    currentSpotId: 'A015',
    entryTime: new Date('2026-03-30T08:30:00'),
  },
  {
    id: 'v2',
    ownerId: '3',
    plateNumber: '29B-67890',
    vehicleType: 'motorcycle',
    status: 'idle',
  },
];

// Demo parking lots
export const mockParkingLots: ParkingLot[] = [
  {
    id: 'p1',
    name: 'Bãi đỗ xe A - Trung tâm',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    adminId: '1',
    totalSpots: 60,
    occupiedSpots: 45,
    rating: 4.5,
    reviews: [
      {
        id: 'r1',
        userId: '3',
        userName: 'Người dùng Lê',
        rating: 5,
        comment: 'Bãi đỗ rất rộng rãi, an toàn, nhân viên thân thiện!',
        date: new Date('2026-03-28'),
      },
      {
        id: 'r2',
        userId: '4',
        userName: 'Nguyễn Văn A',
        rating: 4,
        comment: 'Vị trí thuận tiện, giá cả hợp lý.',
        date: new Date('2026-03-25'),
      },
    ],
    pricing: {
      type: 'hourly',
      car: 20000,
      motorcycle: 5000,
      truck: 50000,
    },
    zones: [
      {
        id: 'z1',
        name: 'Sân A',
        spots: Array.from({ length: 30 }, (_, i) => ({
          id: `A${String(i + 1).padStart(3, '0')}`,
          zoneId: 'z1',
          name: `A${String(i + 1).padStart(3, '0')}`,
          status: i === 14 ? 'occupied' : 'available',
          vehicleId: i === 14 ? 'v1' : undefined,
        })),
      },
      {
        id: 'z2',
        name: 'Sân B',
        spots: Array.from({ length: 30 }, (_, i) => ({
          id: `B${String(i + 1).padStart(3, '0')}`,
          zoneId: 'z2',
          name: `B${String(i + 1).padStart(3, '0')}`,
          status: 'available',
        })),
      },
    ],
    status: 'active',
    latitude: 10.7769,
    longitude: 106.7009,
  },
  {
    id: 'p2',
    name: 'Bãi đỗ xe B - Vincom',
    address: '456 Lê Lợi, Quận 3, TP.HCM',
    adminId: '1',
    totalSpots: 80,
    occupiedSpots: 62,
    rating: 4.2,
    reviews: [],
    pricing: {
      type: 'fixed',
      car: 50000,
      motorcycle: 15000,
      truck: 100000,
    },
    zones: [
      {
        id: 'z3',
        name: 'Tầng 1',
        spots: Array.from({ length: 40 }, (_, i) => ({
          id: `T1-${String(i + 1).padStart(3, '0')}`,
          zoneId: 'z3',
          name: `T1-${String(i + 1).padStart(3, '0')}`,
          status: 'available',
        })),
      },
      {
        id: 'z4',
        name: 'Tầng 2',
        spots: Array.from({ length: 40 }, (_, i) => ({
          id: `T2-${String(i + 1).padStart(3, '0')}`,
          zoneId: 'z4',
          name: `T2-${String(i + 1).padStart(3, '0')}`,
          status: 'available',
        })),
      },
    ],
    status: 'active',
    latitude: 10.7743,
    longitude: 106.6916,
  },
];

// Demo parking sessions (history)
export const mockParkingSessions: ParkingSession[] = [
  {
    id: 's1',
    vehicleId: 'v1',
    plateNumber: '30A-12345',
    parkingLotId: 'p1',
    spotId: 'A015',
    entryTime: new Date('2026-03-30T08:30:00'),
    entryImages: {
      plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
      driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      timestamp: new Date('2026-03-30T08:30:00'),
    },
    paymentStatus: 'pending',
    supervisorId: '2',
  },
  {
    id: 's2',
    vehicleId: 'v1',
    plateNumber: '30A-12345',
    parkingLotId: 'p1',
    spotId: 'A022',
    entryTime: new Date('2026-03-29T14:00:00'),
    exitTime: new Date('2026-03-29T18:15:00'),
    entryImages: {
      plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
      driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      timestamp: new Date('2026-03-29T14:00:00'),
    },
    exitImages: {
      plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
      driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      timestamp: new Date('2026-03-29T18:15:00'),
    },
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    amount: 85000,
    supervisorId: '2',
  },
  {
    id: 's3',
    vehicleId: 'v1',
    plateNumber: '30A-12345',
    parkingLotId: 'p2',
    spotId: 'T1-005',
    entryTime: new Date('2026-03-28T09:00:00'),
    exitTime: new Date('2026-03-28T11:30:00'),
    entryImages: {
      plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
      driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      timestamp: new Date('2026-03-28T09:00:00'),
    },
    exitImages: {
      plate: 'https://images.unsplash.com/photo-1774576670116-a21417528d54?w=400',
      driver: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400',
      timestamp: new Date('2026-03-28T11:30:00'),
    },
    paymentStatus: 'paid',
    paymentMethod: 'coins',
    amount: 50000,
    supervisorId: '2',
  },
];

// Demo transactions
export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    userId: '3',
    type: 'topup',
    amount: 500000,
    virtualCoins: 500,
    description: 'Nạp xu ảo qua MoMo',
    createdAt: new Date('2026-03-25T10:00:00'),
    status: 'completed',
  },
  {
    id: 't2',
    userId: '3',
    type: 'parking_payment',
    amount: 50000,
    virtualCoins: -50,
    description: 'Thanh toán đỗ xe - Bãi B',
    createdAt: new Date('2026-03-28T11:30:00'),
    status: 'completed',
  },
  {
    id: 't3',
    userId: '3',
    type: 'topup',
    amount: 1000000,
    virtualCoins: 1000,
    description: 'Nạp xu ảo qua ZaloPay',
    createdAt: new Date('2026-03-20T15:00:00'),
    status: 'completed',
  },
];

// Demo community posts
export const mockCommunityPosts: CommunityPost[] = [
  {
    id: 'p1',
    authorId: '1',
    authorName: 'Admin Nguyễn',
    authorRole: 'admin',
    type: 'parking_lot_announcement',
    title: 'Bãi đỗ xe A mở cửa phục vụ 24/7',
    content: 'Chúng tôi vui mừng thông báo Bãi đỗ xe A đã chính thức hoạt động 24/7 phục vụ quý khách hàng. Giá ưu đãi trong tháng 3!',
    createdAt: new Date('2026-03-29T10:00:00'),
    likes: 45,
    comments: [
      {
        id: 'c1',
        userId: '3',
        userName: 'Người dùng Lê',
        content: 'Tin tuyệt vời! Tôi sẽ sử dụng dịch vụ.',
        createdAt: new Date('2026-03-29T11:00:00'),
      },
    ],
  },
  {
    id: 'p2',
    authorId: '3',
    authorName: 'Người dùng Lê',
    authorRole: 'owner',
    type: 'general',
    title: 'Đánh giá bãi đỗ xe A',
    content: 'Bãi đỗ rất tốt, an toàn, có camera giám sát 24/7. Nhân viên nhiệt tình. Highly recommended!',
    createdAt: new Date('2026-03-28T14:30:00'),
    likes: 23,
    comments: [],
  },
];

// Demo steal reports
export const mockStealReports: StealReport[] = [];
