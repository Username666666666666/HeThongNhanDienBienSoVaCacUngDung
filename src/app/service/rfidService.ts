export class RFIDService {
  /**
   * Đọc dữ liệu từ thẻ RFID sử dụng Web NFC API
   * Trả về UID hoặc dữ liệu từ thẻ
   */
  async readRFID(): Promise<string> {
    if (!('NDEFReader' in window)) {
      throw new Error('Web NFC API không được hỗ trợ trên trình duyệt này');
    }

    try {
      const ndef = new NDEFReader();
      await ndef.scan();

      return new Promise((resolve, reject) => {
        ndef.onreading = (event: NDEFReadingEvent) => {
          // Lấy UID hoặc dữ liệu từ thẻ
          const uid = event.serialNumber || 'unknown';
          resolve(uid);
        };

        ndef.onreadingerror = (event: Event) => {
          reject(new Error('Lỗi khi đọc thẻ RFID'));
        };

        // Timeout sau 30 giây
        setTimeout(() => {
          reject(new Error('Timeout khi đọc thẻ RFID'));
        }, 30000);
      });
    } catch (error) {
      console.error('RFID Read Error:', error);
      throw error;
    }
  }

  /**
   * Tạo mã theo quy tắc: [Mã Bãi Xe]-[Loại Xe]-[Biển Số]
   * @param maBaiXe Mã của bãi xe
   * @param loaiXe Loại xe (ví dụ: car, motorbike)
   * @param bienSo Biển số xe từ LPR
   * @returns Mã được tạo
   */
  generateCode(maBaiXe: string, loaiXe: string, bienSo: string): string {
    return `${maBaiXe}-${loaiXe}-${bienSo}`;
  }

  /**
   * Kết hợp đọc RFID và tạo mã
   * @param maBaiXe Mã bãi xe
   * @param loaiXe Loại xe
   * @param bienSo Biển số từ LPR
   * @returns Object chứa RFID data và mã được tạo
   */
  async processRFIDAndGenerateCode(maBaiXe: string, loaiXe: string, bienSo: string): Promise<{ rfidData: string; code: string }> {
    const rfidData = await this.readRFID();
    const code = this.generateCode(maBaiXe, loaiXe, bienSo);
    return { rfidData, code };
  }
}