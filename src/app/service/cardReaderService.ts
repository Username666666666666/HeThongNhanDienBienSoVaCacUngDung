import { fetchRecord } from './queryHelper';
import { ParkingLot, Vehicle } from '../types';

/**
 * Interface định nghĩa sự kiện từ thiết bị đọc thẻ
 */
export interface CardReaderEvent {
  uid: string; // Mã định danh duy nhất của thẻ
  timestamp: Date;
  gateId: string; // ID của Gate
  parkingLotId: string;
}

/**
 * Interface cho thông tin biển số đã được LPR đọc
 */
export interface LPRPlateInfo {
  plateNumber: string; // Biển số thô từ LPR
  vehicleType: 'car' | 'motorcycle' | 'truck';
  imageUrl?: string;
  timestamp: Date;
}

/**
 * Interface cho mã biển số định chuẩn
 */
export interface StandardizedPlateCode {
  parkingLotCode: string; // Mã bãi xe
  vehicleType: 'car' | 'motorcycle' | 'truck';
  plateNumber: string; // Biển số
  fullCode: string; // [Mã Bãi Xe]-[Loại Xe]-[Biển Số]
}

/**
 * Callback function type cho sự kiện card reader
 */
export type CardReaderEventCallback = (
  event: CardReaderEvent,
  plateData: StandardizedPlateCode
) => Promise<void> | void;

/**
 * Service quản lý lắng nghe sự kiện từ thiết bị đọc thẻ (RFID Card Reader)
 */
class CardReaderService {
  private listeners: Map<string, CardReaderEventCallback[]> = new Map();
  private lprPlateStore: Map<string, LPRPlateInfo> = new Map(); // Lưu trữ biển số từ LPR tạm thời
  private isConnected: boolean = false;

  /**
   * Khởi tạo kết nối với thiết bị đọc thẻ
   * @param gateId - ID của Gate
   * @param parkingLotId - ID của bãi xe
   */
  public async initialize(gateId: string, parkingLotId: string): Promise<void> {
    try {
      console.log(`[CardReader] Initializing reader for Gate: ${gateId}, ParkingLot: ${parkingLotId}`);
      
      // Kiểm tra kết nối tới thiết bị
      await this.checkDeviceConnection();
      
      this.isConnected = true;
      console.log('[CardReader] Device initialized successfully');
    } catch (error) {
      console.error('[CardReader] Failed to initialize:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Kiểm tra kết nối với thiết bị
   */
  private async checkDeviceConnection(): Promise<void> {
    // TODO: Triển khai logic kết nối với thiết bị thực tế
    // Có thể là WebSocket, Serial port, hoặc HTTP API
    return Promise.resolve();
  }

  /**
   * Lắng nghe sự kiện card reader
   * @param callback - Hàm callback khi có thẻ được quét
   */
  public onCardDetected(callback: CardReaderEventCallback): void {
    const callbackId = 'default';
    if (!this.listeners.has(callbackId)) {
      this.listeners.set(callbackId, []);
    }
    this.listeners.get(callbackId)!.push(callback);
    console.log('[CardReader] Listener registered');
  }

  /**
   * Gỡ bỏ listener
   * @param callback - Hàm callback cần gỡ bỏ
   */
  public offCardDetected(callback: CardReaderEventCallback): void {
    for (const [, callbacks] of this.listeners) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    console.log('[CardReader] Listener removed');
  }

  /**
   * Lưu trữ thông tin biển số từ LPR để xử lý sau
   * @param gateId - ID của Gate
   * @param plateInfo - Thông tin biển số từ LPR
   */
  public storeLPRPlateInfo(gateId: string, plateInfo: LPRPlateInfo): void {
    this.lprPlateStore.set(gateId, plateInfo);
    console.log(`[CardReader] Stored LPR plate info for gate ${gateId}:`, plateInfo.plateNumber);
  }

  /**
   * Lấy thông tin biển số đã được LPR đọc từ Gate
   * @param gateId - ID của Gate
   * @returns Thông tin biển số hoặc null nếu không tìm thấy
   */
  private getLPRPlateFromGate(gateId: string): LPRPlateInfo | null {
    return this.lprPlateStore.get(gateId) || null;
  }

  /**
   * Biến đổi thông tin biển số thành mã biển số chuẩn
   * Quy tắc: [Mã Bãi Xe]-[Loại Xe]-[Biển Số]
   * @param parkingLotCode - Mã bãi xe
   * @param plateInfo - Thông tin biển số từ LPR
   * @returns Mã biển số định chuẩn
   */
  private standardizePlateCode(
    parkingLotCode: string,
    plateInfo: LPRPlateInfo
  ): StandardizedPlateCode {
    // Ánh xạ loại xe thành code ngắn
    const vehicleTypeMap: Record<string, string> = {
      car: 'CAR',
      motorcycle: 'MOTO',
      truck: 'TRUCK',
    };

    const vehicleCode = vehicleTypeMap[plateInfo.vehicleType] || 'UNKNOWN';
    const cleanPlateNumber = plateInfo.plateNumber.trim().toUpperCase().replace(/\s+/g, '');

    const fullCode = `${parkingLotCode}-${vehicleCode}-${cleanPlateNumber}`;

    return {
      parkingLotCode,
      vehicleType: plateInfo.vehicleType,
      plateNumber: cleanPlateNumber,
      fullCode,
    };
  }

  /**
   * Xử lý sự kiện khi có thẻ được quét
   * @param cardEvent - Sự kiện từ card reader
   */
  public async handleCardEvent(cardEvent: CardReaderEvent): Promise<void> {
    try {
      console.log(`[CardReader] Card detected - UID: ${cardEvent.uid}, Gate: ${cardEvent.gateId}`);

      // Bước 1: Lấy thông tin bãi xe
      const { data: parkingLot, error: parkingLotError } = await fetchRecord<ParkingLot>(
        'parking_lots',
        { id: cardEvent.parkingLotId }
      );

      if (parkingLotError || !parkingLot) {
        console.error('[CardReader] Failed to fetch parking lot:', parkingLotError);
        throw new Error('Không tìm thấy thông tin bãi xe');
      }

      const parkingLotCode = parkingLot.id.toUpperCase().substring(0, 3); // Lấy 3 ký tự đầu làm code

      // Bước 2: Lấy thông tin biển số từ LPR
      const lprPlateInfo = this.getLPRPlateFromGate(cardEvent.gateId);
      if (!lprPlateInfo) {
        console.error('[CardReader] LPR plate info not found for gate:', cardEvent.gateId);
        throw new Error('Không tìm thấy thông tin biển số từ LPR');
      }

      // Bước 3: Biến đổi thành mã biển số chuẩn
      const standardizedCode = this.standardizePlateCode(parkingLotCode, lprPlateInfo);
      console.log('[CardReader] Standardized plate code:', standardizedCode.fullCode);

      // Bước 4: Emit sự kiện cho tất cả listeners
      await this.emitCardReaderEvent(cardEvent, standardizedCode);
    } catch (error) {
      console.error('[CardReader] Error handling card event:', error);
      throw error;
    }
  }

  /**
   * Phát sự kiện card detected cho tất cả listeners
   * @param cardEvent - Sự kiện card reader
   * @param plateCode - Mã biển số đã định chuẩn
   */
  private async emitCardReaderEvent(
    cardEvent: CardReaderEvent,
    plateCode: StandardizedPlateCode
  ): Promise<void> {
    const callbacks = this.listeners.get('default') || [];
    
    for (const callback of callbacks) {
      try {
        await callback(cardEvent, plateCode);
      } catch (error) {
        console.error('[CardReader] Error in listener callback:', error);
      }
    }
  }

  /**
   * Xóa dữ liệu LPR đã lưu cho một Gate
   * @param gateId - ID của Gate
   */
  public clearLPRPlateInfo(gateId: string): void {
    this.lprPlateStore.delete(gateId);
    console.log(`[CardReader] Cleared LPR plate info for gate ${gateId}`);
  }

  /**
   * Kiểm tra trạng thái kết nối
   */
  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Ngắt kết nối với thiết bị
   */
  public async disconnect(): Promise<void> {
    try {
      this.listeners.clear();
      this.lprPlateStore.clear();
      this.isConnected = false;
      console.log('[CardReader] Disconnected successfully');
    } catch (error) {
      console.error('[CardReader] Error during disconnect:', error);
    }
  }
}

// Singleton instance
const cardReaderService = new CardReaderService();

export default cardReaderService;
export { CardReaderService };
