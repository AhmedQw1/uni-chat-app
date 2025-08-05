import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from 'uuid';

// Load AWS configuration from environment variables
const region = import.meta.env.VITE_AWS_REGION || 'ap-south-1'; // Default to Mumbai
const accessKeyId = import.meta.env.VITE_AWS_ACCESS_KEY;
const secretAccessKey = import.meta.env.VITE_AWS_SECRET_KEY;
const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET || 'uni-chat-uploads';

// Verify environment variables are loaded
if (!accessKeyId || !secretAccessKey) {
  console.error("AWS credentials missing. Check your environment variables.");
}

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey
  }
});

// Map of file types to path prefixes
const typeToPrefix = {
  image: 'images/',
  document: 'documents/',
  video: 'videos/',
  audio: 'audio/',
  compressed: 'archives/',
  other: 'misc/'
};

// Generate a presigned URL for uploading
export const getPresignedUploadUrl = async (fileInfo, fileType, groupId) => {
  try {
    const extension = fileInfo.name.split('.').pop().toLowerCase();
    const fileName = `${uuidv4()}.${extension}`;
    
    const prefix = typeToPrefix[fileType] || typeToPrefix.other;
    const key = `${prefix}${groupId}/${fileName}`;
    
    // Create a command to generate a presigned URL for PUT
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileInfo.type,
      ContentDisposition: 'inline'
    });
    
    // Generate a presigned URL for uploading (PUT)
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    
    return {
      uploadUrl: presignedUrl,
      key: key,
      fileType: fileType
    };
  } catch (error) {
    console.error('Error generating presigned upload URL:', error);
    throw error;
  }
};

// Upload file directly using a presigned URL
export const uploadWithPresignedUrl = async (file, uploadUrl, onProgress = null) => {
  try {
    // Simulate initial progress
    if (onProgress) {
      onProgress(10);
    }
    
    // Use the browser's fetch API for the upload
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type
      }
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed with status: ${response.status}`);
    }
    
    // Complete progress
    if (onProgress) {
      onProgress(100);
    }
    
    return true;
  } catch (error) {
    console.error('Error in direct upload:', error);
    throw error;
  }
};

// Combined function for easier use in components
export const uploadFileToS3 = async (file, fileType, groupId, onProgress = null) => {
  try {
    console.log("Starting S3 upload with params:", {
      region,
      bucketName: BUCKET_NAME,
      fileType,
      groupId,
      fileName: file.name,
      fileSize: file.size
    });
    
    // Step 1: Get a presigned URL for uploading
    if (onProgress) onProgress(5);
    const { uploadUrl, key } = await getPresignedUploadUrl(file, fileType, groupId);
    
    // Step 2: Upload the file directly using the presigned URL
    if (onProgress) onProgress(10);
    await uploadWithPresignedUrl(file, uploadUrl, (progress) => {
      if (onProgress) {
        // Scale progress from 10-90%
        onProgress(10 + (progress * 0.8));
      }
    });
    
    // Step 3: Generate a URL for viewing/downloading the file
    if (onProgress) onProgress(90);
    const getCommand = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    const downloadUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 604800 });
    
    if (onProgress) onProgress(100);
    
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      url: downloadUrl,
      key: key,
      fileType: fileType
    };
  } catch (error) {
    console.error('Error in S3 upload process:', error);
    throw error;
  }
};

export const getFileUrl = async (key) => {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};