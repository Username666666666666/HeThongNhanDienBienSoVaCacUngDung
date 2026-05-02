// User types
export type UserRole = 'admin' | 'supervisor' | 'owner' | 'support' | 'provider';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  virtualCoins: number;
  phone?: string;
  avatar?: string;
  cccd?: string;
  createdAt?: Date;
}

// Vehicle types
export type VehicleType = 'car' | 'motorcycle' | 'truck' | 'electric_bike';
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
}

// Parking lot types
export type ParkingLotStatus = 'active' | 'maintenance' | 'inactive';

export interface ParkingLot {
  id: string;
  name: string;
  address: string;
  adminId: string;
  totalSpots: number;
  occupiedSpots: number;
  rating: number;
  status: ParkingLotStatus;
  latitude?: number;
  longitude?: number;
  description?: string;
}

// Session types
export interface ParkingSession {
  id: string;
  vehicleId: string;
  plateNumber: string;
  parkingLotId: string;
  spotId: string;
  entryTime: Date;
  exitTime?: Date;
  paymentStatus: 'pending' | 'paid' | 'failed';
  amount?: number;
  supervisorId: string;
}

// Transaction types
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
