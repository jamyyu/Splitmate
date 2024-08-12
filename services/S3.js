import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { resizeImage } from './resizeImg.js';
import dotenv from 'dotenv';
import { randomBytes } from 'crypto';


dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;


// 初始化 S3 客戶端
const s3 = new S3Client({
  region: bucketRegion,
  credentials: {
    accessKeyId: accessKey,
    secretAccessKey: secretAccessKey,
  }
});


const randomImageName = (bytes = 32) => randomBytes(bytes).toString('hex');


// 上傳文件到 S3 (file傳入的是req.file)
export const uploadFileToS3 = async (file) => {
  //調整圖片大小
  const buffer = await resizeImage(file.buffer);
  //生成圖片名稱
  const key = randomImageName();
  const params = {
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: file.mimetype,
  };
  const command = new PutObjectCommand(params);
  const uploadResult = await s3.send(command);
  return { ...uploadResult, key };
};

