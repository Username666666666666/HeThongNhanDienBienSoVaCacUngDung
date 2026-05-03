import { fetchRecord } from './queryHelper';
import { ParkingLot, Vehicle } from '../types';

/**
 * Interface định nghĩa sự kiện từ thiết bị đọc thẻ
 */
export interface CardReaderEvent {
  uid: string;
  timestamp: Date;
  gateId: string;
  parkingLotId: string;
}

/**
 * Interface cho thông tin biển số đã được LPR đọc
 */
export interface LPRPlateInfo {
  plateNumber: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  imageUrl?: string;
  timestamp: Date;
}

/**
 * Interface cho mã biển số định chuẩn
 */
export interface StandardizedPlateCode {
  parkingLotCode: string;
  vehicleType: 'car' | 'motorcycle' | 'truck';
  plateNumber: string;
  fullCode: string;
}

/**
 * Callback function type
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
  private lprPlateStore: Map<string, LPRPlateInfo> = new Map();
  private isConnected: boolean = false;

  public async initialize(gateId: string, parkingLotId: string): Promise<void> {
    try {
      console.log(`[CardReader] Initializing reader for Gate: ${gateId}, ParkingLot: ${parkingLotId}`);

      await this.checkDeviceConnection();

      this.isConnected = true;
      console.log('[CardReader] Device initialized successfully');
    } catch (error) {
      console.error('[CardReader] Failed to initialize:', error);
      this.isConnected = false;
      throw error;
    }
  }

  private async checkDeviceConnection(): Promise<void> {
    return Promise.resolve();
  }

  public onCardDetected(callback: CardReaderEventCallback): void {
    const callbackId = 'default';
    if (!this.listeners.has(callbackId)) {
      this.listeners.set(callbackId, []);
    }
    this.listeners.get(callbackId)!.push(callback);
    console.log('[CardReader] Listener registered');
  }

  public offCardDetected(callback: CardReaderEventCallback): void {
    for (const [, callbacks] of this.listeners) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
    console.log('[CardReader] Listener removed');
  }

  public storeLPRPlateInfo(gateId: string, plateInfo: LPRPlateInfo): void {
    this.lprPlateStore.set(gateId, plateInfo);
    console.log(`[CardReader] Stored LPR plate info for gate ${gateId}:`, plateInfo.plateNumber);
  }

  private getLPRPlateFromGate(gateId: string): LPRPlateInfo | null {
    return this.lprPlateStore.get(gateId) || null;
  }

  private standardizePlateCode(
    parkingLotCode: string,
    plateInfo: LPRPlateInfo
  ): StandardizedPlateCode {
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

  public async handleCardEvent(cardEvent: CardReaderEvent): Promise<void> {
    try {
      console.log(`[CardReader] Card detected - UID: ${cardEvent.uid}, Gate: ${cardEvent.gateId}`);

      const { data: parkingLot, error: parkingLotError } = await fetchRecord<ParkingLot>(
        'parking_lots',
        { id: cardEvent.parkingLotId }
      );

      if (parkingLotError || !parkingLot) {
        console.error('[CardReader] Failed to fetch parking lot:', parkingLotError);
        throw new Error('Không tìm thấy thông tin bãi xe');
      }

      const parkingLotCode = parkingLot.id.toUpperCase().substring(0, 3);

      const lprPlateInfo = this.getLPRPlateFromGate(cardEvent.gateId);
      if (!lprPlateInfo) {
        console.error('[CardReader] LPR plate info not found for gate:', cardEvent.gateId);
        throw new Error('Không tìm thấy thông tin biển số từ LPR');
      }

      const standardizedCode = this.standardizePlateCode(parkingLotCode, lprPlateInfo);
      console.log('[CardReader] Standardized plate code:', standardizedCode.fullCode);

      await this.emitCardReaderEvent(cardEvent, standardizedCode);
    } catch (error) {
      console.error('[CardReader] Error handling card event:', error);
      throw error;
    }
  }

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

  public clearLPRPlateInfo(gateId: string): void {
    this.lprPlateStore.delete(gateId);
    console.log(`[CardReader] Cleared LPR plate info for gate ${gateId}`);
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

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

const cardReaderService = new CardReaderService();

export default cardReaderService;
export { CardReaderService };
