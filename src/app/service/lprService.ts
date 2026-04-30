import { Client } from "@gradio/client";

/**
 * License Plate Recognition (LPR) API Result Structure
 */
interface LPRResult {
  data: [
    { url: string; [key: string]: any }, // Object chứa ảnh đã xử lý
    string                               // Chữ số biển số xe
  ];
}

/**
 * Process a license plate image using the Gradio LPR model
 * 
 * This function sends an image to the tpc-pascal/LPR Gradio endpoint
 * to recognize and extract the license plate number from the image.
 * 
 * @param {File | Blob} image - The image file or blob containing the license plate
 * @returns {Promise<string>} The recognized license plate number
 * @throws {Error} If the image is invalid or the API returns an error
 * 
 * @example
 * const file = event.target.files[0];
 * const plateNumber = await processLicensePlate(file);
 * console.log(plateNumber); // "30A-12345"
 */
export async function processLicensePlate(image: File | Blob): Promise<string> {
  try {
    const client = await Client.connect("tpc-pascal/LPR");
    const result = await client.predict("/process_image", {
      input_img: image,
    }) as LPRResult | { data: any[] };

    if (!result?.data || !Array.isArray(result.data)) {
      throw new Error("LPR API trả về dữ liệu không hợp lệ");
    }

    const plateCandidate = result.data[1] ?? result.data[0];
    if (typeof plateCandidate !== "string") {
      throw new Error("Không xác định được biển số từ API");
    }

    return plateCandidate;
  } catch (error) {
    console.error("LPR API Error:", error);
    throw error;
  }
}