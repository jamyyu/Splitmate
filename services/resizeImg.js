import sharp from 'sharp';

export const resizeImage = async function (fileBuffer) {
  try {
    // 獲取圖像的數據（包括寬度）
    const metadata = await sharp(fileBuffer).metadata();
    
    // 如果圖像寬度小於700，不進行調整，直接返回原始buffer
    if (metadata.width && metadata.width <= 700) {
      return fileBuffer;
    }
    
    // 如果圖像寬度大於700，調整圖像大小，並保持原始方向
    const buffer = await sharp(fileBuffer)
      .rotate() // 這裡確保圖像方向不會改變
      .resize({ width: 700, fit: 'contain' })
      .toBuffer();
    
    return buffer;
  } catch (error) {
    throw error;
  }
}