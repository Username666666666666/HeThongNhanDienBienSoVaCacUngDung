import { ParkingSession } from '../types';

/**
 * Mock Data Store
 * 
 * This file contains mock data for development and testing purposes.
 * In production, this data should come from the Supabase backend.
 * 
 * REMOVED: mockUsers, mockVehicles, mockParkingLots, mockTransactions, 
 *          mockCommunityPosts, mockStealReports (unused in codebase)
 * RETAINED: mockParkingSessions (used in ParkingHistory.tsx)
 * 
 * TODO: Replace all mock data with actual API calls to Supabase
 */

/**
 * Mock parking session history
 * Used in: ParkingHistory.tsx for supervisor dashboard
 * TODO: Replace with actual data from Supabase 'lichsuxevao' table
 */
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

