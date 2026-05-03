import { Client } from "@gradio/client";
import { isLPRResult } from "../utils/typeGuards";

export async function processLicensePlate(image: File | Blob): Promise<string> {
  try {
    const client = await Client.connect("tpc-pascal/LPR");
    const result = (await client.predict("/process_image", {
      input_img: image,
    })) as unknown;

    if (!isLPRResult(result)) {
      throw new Error("LPR API trả về dữ liệu không hợp lệ hoặc không đúng định dạng");
    }

    return result.data[1];
  } catch (error) {
    console.error("LPR API Error:", error);
    throw error;
  }
}