// User types
export type UserRole = 'super_admin' | 'admin' | 'supervisor' | 'owner' | 'support' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  virtualCoins: number;
  phone: string;
  avatar?: string;
  cccd?: string;
  driverLicense?: string;
  createdAt?: Date;
  managedParkingLots?: string[]; // For admin
  joinedCommunities?: string[]; // Parking lot codes
  isBanned?: boolean;
  bannedFrom?: string[]; // Parking lot codes where user is banned
}

// Vehicle types
export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'electric_bike' | 'bicycle';
export type VehicleStatus = 'parked' | 'idle' | 'stolen';

export interface Vehicle {
  id: string;
  ownerId: string;
  plateNumber: string;
  vehicleType: VehicleType;
  status: VehicleStatus;
  currentParkingLotId?: string;
  currentSpotId?: string;
  entryTime?: Date;
  brand?: string;
  color?: string;
  registrationDoc?: string;
  verificationStatus?: 'pending' | 'verified' | 'rejected';
}

// Parking lot types
export type ParkingLotStatus = 'active' | 'maintenance' | 'inactive';
export type SpotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';
export type PricingType = 'hourly' | 'fixed' | 'daily';

export interface ParkingSpot {
  id: string;
  zoneId: string;
  name: string;
  status: SpotStatus;
  vehicleId?: string;
}

export interface ParkingZone {
  id: string;
  name: string;
  spots: ParkingSpot[];
}

export interface ParkingLotPricing {
  type: PricingType;
  car: number;
  motorcycle: number;
  truck: number;
  electric_bike?: number;
  bicycle?: number;
  allowedVehicleTypes: VehicleType[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
  userAvatar?: string;
}

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  adminId: string;
  totalSpots: number;
  occupiedSpots: number;
  rating: number;
  reviews: Review[];
  pricing: ParkingLotPricing;
  zones: ParkingZone[];
  status: ParkingLotStatus;
  latitude?: number;
  longitude?: number;
  supervisorIds?: string[];
  images?: string[];
  description?: string;
  amenities?: string[];
  acceptVirtualCoins?: boolean;
}

// Parking session types
export type PaymentStatus = 'pending' | 'paid' | 'failed';
export type PaymentMethod = 'cash' | 'online' | 'coins';

export interface CapturedImages {
  plate: string;
  driver: string;
  timestamp: Date;
}

export interface ParkingSession {
  id: string;
  vehicleId: string;
  plateNumber: string;
  parkingLotId: string;
  spotId: string;
  entryTime: Date;
  exitTime?: Date;
  entryImages: CapturedImages;
  exitImages?: CapturedImages;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  amount?: number;
  supervisorId: string;
  exitSupervisorId?: string;
  reservationId?: string;
  isPrepaid?: boolean;
}

// Reservation types
export type ReservationStatus = 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Reservation {
  id: string;
  userId: string;
  vehicleId: string;
  parkingLotId: string;
  spotId: string;
  vehicleType: VehicleType;
  startTime: Date;
  endTime?: Date;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: ReservationStatus;
  createdAt: Date;
  notes?: string;
}

// Transaction types
export type TransactionType = 'topup' | 'parking_payment' | 'refund' | 'reservation';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  virtualCoins: number;
  description: string;
  createdAt: Date;
  status: TransactionStatus;
  discount?: number;
  eventId?: string;
}

// Discount Event types
export interface DiscountEvent {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  minAmount?: number;
  maxDiscount?: number;
}

// Community post types
export type PostType = 'general' | 'parking_lot_announcement' | 'suspicious_activity' | 'theft_report';
export type PostStatus = 'pending' | 'approved' | 'rejected';

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  type: PostType;
  title: string;
  content: string;
  images?: string[];
  parkingLotId?: string;
  createdAt: Date;
  likes: number;
  comments: Comment[];
  status?: PostStatus; // For posts that need approval
}

// Theft report types
export type TheftReportStatus = 'reported' | 'investigating' | 'resolved' | 'rejected';

export interface StealReport {
  id: string;
  vehicleId: string;
  plateNumber: string;
  parkingLotId: string;
  spotId: string;
  reportedBy: string;
  reportedAt: Date;
  description: string;
  suspiciousImages?: string[];
  status: TheftReportStatus;
  resolvedAt?: Date;
  resolution?: string;
}

// Statistics types
export interface ParkingStats {
  totalVehicles: number;
  currentlyParked: number;
  todayEntries: number;
  todayExits: number;
  todayRevenue: number;
  occupancyRate: number;
}

export interface VehicleActivity {
  time: string;
  entry: number;
  exit: number;
}