export interface User {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'supervisor' | 'admin' | 'support' | 'provider';
  avatar?: string;
  virtualCoins: number;
  phone?: string;
  cccd?: string;
}

export interface Vehicle {
  id: string;
  ownerId: string;
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  registrationDoc?: string;
  cccd?: string;
  status: 'idle' | 'parked' | 'stolen';
  currentParkingLotId?: string;
  currentSpotId?: string;
  entryTime?: Date;
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
  pricing: {
    type: 'fixed' | 'hourly';
    car: number;
    motorcycle: number;
    truck: number;
  };
  zones: ParkingZone[];
  status: 'active' | 'inactive';
  latitude?: number;
  longitude?: number;
}

export interface ParkingZone {
  id: string;
  name: string;
  spots: ParkingSpot[];
}

export interface ParkingSpot {
  id: string;
  zoneId: string;
  name: string;
  status: 'available' | 'occupied' | 'reserved';
  vehicleId?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: Date;
}

export interface ParkingSession {
  id: string;
  vehicleId: string;
  plateNumber: string;
  parkingLotId: string;
  spotId: string;
  entryTime: Date;
  exitTime?: Date;
  entryImages: {
    plate: string;
    driver: string;
    timestamp: Date;
  };
  exitImages?: {
    plate: string;
    driver: string;
    timestamp: Date;
  };
  paymentStatus: 'pending' | 'paid' | 'prepaid';
  paymentMethod?: 'cash' | 'online' | 'coins';
  amount?: number;
  supervisorId: string;
}

export interface StealReport {
  id: string;
  vehicleId: string;
  plateNumber: string;
  parkingLotId: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'reported' | 'verified' | 'resolved';
  description: string;
  images?: string[];
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'owner' | 'supervisor' | 'admin';
  type: 'general' | 'theft_report' | 'parking_lot_announcement';
  title: string;
  content: string;
  images?: string[];
  relatedStealReportId?: string;
  createdAt: Date;
  likes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'topup' | 'parking_payment' | 'refund';
  amount: number;
  virtualCoins: number;
  description: string;
  createdAt: Date;
  status: 'completed' | 'pending' | 'failed';
}
