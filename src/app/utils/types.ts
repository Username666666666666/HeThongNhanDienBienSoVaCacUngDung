/**
 * Định tuyến loại dữ liệu
 */
export interface PricingOption {
  vehicleType: string;
  price: number;
}

export interface ZoneOption {
  id: string;
  name: string;
}

export interface AmenityRow {
  id: string;
  name: string;
  available: boolean;
}

/**
 * Loại để quản lý dữ liệu bãi đỗ chi tiết
 */
export interface ParkingLotDetail {
  id: string;
  name: string;
  address: string;
  description?: string;
  status: 'active' | 'maintenance' | 'inactive';
  totalSpots: number;
  zones: ZoneOption[];
  pricing: PricingOption[];
  amenities: AmenityRow[];
}

/**
 * Loại để quản lý tải async
 */
export interface AsyncRequest<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Loại để quản lý modal
 */
export interface ModalConfig {
  isOpen: boolean;
  title?: string;
  message?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

/**
 * Kiểu cho API response
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Kiểu cho pagination
 */
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
