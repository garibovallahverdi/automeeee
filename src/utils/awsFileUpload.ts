import multer from 'multer';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv'

dotenv.config()
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

const upload = multer({
    storage: multerS3({
      s3: s3,
      bucket: process.env.AWS_S3_BUCKET_NAME!,
      // acl: 'public-read',
      key: function (req, file, cb) {
        cb(null, `${Date.now().toString()}-${file.originalname}`);
      },
    }),
  });
  

export const uploadFiles = upload.fields([
  { name: 'frontImage', maxCount: 1 },
  { name: 'backImage', maxCount: 1 },
  { name: 'insideImage', maxCount: 1 },
  { name: 'othersImage', maxCount: 10 },
  { name: 'insurancePolicy', maxCount: 1 },
  { name: 'technicalDocument', maxCount: 1 },
]);




export async function deleteFileFromS3(key: string) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables");
  }

  const params = {
    Bucket: bucketName,
    Key: key,
  };
  
  try {
    const result = await s3.send(new DeleteObjectCommand(params));
    console.log(`File deleted successfully: ${key}`, result);
  } catch (error) {
    console.error(`Error deleting file: ${key}`, error);
  }
}


export async function deleteOldFiles(location: string) {
  const bucketName = process.env.AWS_S3_BUCKET_NAME;
  if (!bucketName) {
    throw new Error("Bucket name is not defined in environment variables");
  }

  const key = location.substring(location.lastIndexOf('/') + 1);

  if (!key) {
    throw new Error("Failed to extract S3 key from the location URL");
  }

  const params = {
    Bucket: bucketName,
    Key: key,
  };

  try {
    const result = await s3.send(new DeleteObjectCommand(params));
    console.log(`File deleted successfully: ${key}`, result);
  } catch (error) {
    console.error(`Error deleting file: ${key}`, error);
  }
}
