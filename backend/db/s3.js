const { S3Client, PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs').promises;
const path = require('path');

// Initialize S3 client with credentials from environment
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const bucketName = process.env.S3_BUCKET_NAME;

/**
 * Upload a file to S3
 * @param {string} filePath - Local file path
 * @param {string} fileName - Desired file name in S3
 * @returns {Promise<string>} - Public URL of uploaded file
 */
const uploadToS3 = async (filePath, fileName) => {
  try {
    // Read file content
    const fileContent = await fs.readFile(filePath);
    
    // Get file extension for content type
    const ext = path.extname(fileName).toLowerCase();
    const contentTypeMap = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'application/octet-stream';

    // Create unique file name with timestamp
    const timestamp = Date.now();
    const uniqueFileName = `products/${timestamp}-${fileName}`;

    // Upload to S3
    const uploadParams = {
      Bucket: bucketName,
      Key: uniqueFileName,
      Body: fileContent,
      ContentType: contentType,
      ACL: 'public-read', // Make file publicly accessible
    };

    const command = new PutObjectCommand(uploadParams);
    await s3Client.send(command);

    // Construct public URL
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueFileName}`;
    
    console.log('✅ File uploaded to S3:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ S3 upload error:', error);
    throw new Error(`Failed to upload to S3: ${error.message}`);
  }
};

/**
 * Delete a file from S3
 * @param {string} fileUrl - Full S3 URL of the file
 * @returns {Promise<boolean>} - Success status
 */
const deleteFromS3 = async (fileUrl) => {
  try {
    // Extract key from URL
    // URL format: https://bucket-name.s3.region.amazonaws.com/key
    const urlParts = fileUrl.split('.amazonaws.com/');
    if (urlParts.length < 2) {
      console.warn('Invalid S3 URL format:', fileUrl);
      return false;
    }
    
    const key = urlParts[1];

    const deleteParams = {
      Bucket: bucketName,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    
    console.log('✅ File deleted from S3:', key);
    return true;
  } catch (error) {
    console.error('❌ S3 delete error:', error);
    // Don't throw error, just log it
    return false;
  }
};

/**
 * Check if S3 is properly configured
 * @returns {boolean}
 */
const isS3Configured = () => {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_REGION &&
    process.env.S3_BUCKET_NAME
  );
};

module.exports = {
  uploadToS3,
  deleteFromS3,
  isS3Configured,
};
