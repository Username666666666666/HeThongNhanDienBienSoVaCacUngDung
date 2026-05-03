import axios from 'axios';

/**
 * Interface cho kết quả LPR
 */
interface LPRResult {
  data: [
    { url: string; [key: string]: any },
    string
  ];
}

/**
 * Xử lý ảnh biển số xe qua Gradio LPR API
 * @param imageUri - URI của ảnh (base64 hoặc URL)
 * @returns Chuỗi biển số đã nhận dạng
 */
export async function processLicensePlate(imageUri: string): Promise<string> {
  try {
    // Nếu là base64, convert thành blob
    let imageData = imageUri;
    
    if (imageUri.startsWith('data:image')) {
      imageData = imageUri;
    }

    // Gửi tới Gradio LPR API
    const response = await axios.post('http://tpc-pascal-lpr.gradio.app/api/predict', {
      input_img: imageData,
    }, {
      timeout: 30000, // 30s timeout
    });

    const result = response.data as LPRResult | { data: any[] };

    if (!result?.data || !Array.isArray(result.data)) {
      throw new Error('LPR API trả về dữ liệu không hợp lệ');
    }

    const plateCandidate = result.data[1] ?? result.data[0];
    if (typeof plateCandidate !== 'string') {
      throw new Error('Không xác định được biển số từ API');
    }

    return plateCandidate;
  } catch (error) {
    console.error('LPR API Error:', error);
    throw error;
  }
}

/**
 * Alias function cho compatibility
 */
export const recognizePlateNumber = processLicensePlate;
