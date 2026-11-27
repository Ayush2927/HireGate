import { v2 as cloudinary } from 'cloudinary'

const cloudName = process.env.CLOUDINARY_CLOUD_NAME
const apiKey = process.env.CLOUDINARY_API_KEY
const apiSecret = process.env.CLOUDINARY_API_SECRET

const isConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isConfigured) {
    cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
    });
}

export interface CloudinaryUploadSignature {
    cloudName: string,
    apiKey: string,
    timestamp: number,
    folder: string,
    signature: string
};

export function createResumeUploadSignature(studentId: string): CloudinaryUploadSignature | null {
    if (!isConfigured || !cloudName || !apiKey || !apiSecret) {
        return null;
    }

    const timestamp = Math.round(Date.now() / 1000);
    const folder = `hiregate/resumes/${studentId}`

    const signature = cloudinary.utils.api_sign_request(
        { timestamp, folder },
        apiSecret
    );
    return {
        cloudName,
        apiKey,
        timestamp,
        folder,
        signature,
    };
}
