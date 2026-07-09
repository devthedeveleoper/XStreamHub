import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import fs from 'fs';
import path from 'path';
import os from 'os';
import axios from 'axios';
import FormData from 'form-data';

const AURA_API_BASE_URL = "https://api.aurahub.fun";
const UPLOAD_FOLDER_ID = process.env.UPLOAD_FOLDER_ID;

export async function POST(request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const chunk = formData.get('chunk');
        const uploadId = formData.get('uploadId');
        const chunkIndex = parseInt(formData.get('chunkIndex'), 10);
        const totalChunks = parseInt(formData.get('totalChunks'), 10);
        const fileName = formData.get('fileName');

        if (!chunk || !uploadId || isNaN(chunkIndex) || isNaN(totalChunks) || !fileName) {
            return NextResponse.json({ message: 'Missing chunk parameters' }, { status: 400 });
        }

        const tempDir = os.tmpdir();
        const uploadFilePath = path.join(tempDir, `${uploadId}_${fileName}`);

        // Read the chunk data
        const arrayBuffer = await chunk.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Append to the temp file
        // Note: For large files, we just append synchronously to ensure order if they are sent sequentially.
        // The frontend MUST send chunks sequentially for appendFileSync to work correctly without seek.
        fs.appendFileSync(uploadFilePath, buffer);

        // Check if this is the final chunk
        if (chunkIndex === totalChunks - 1) {
            console.log(`[Upload-Chunk] All chunks received for ${fileName}. Uploading to media server...`);
            
            // 1. Get upload URL
            const urlResponse = await axios.get(`${AURA_API_BASE_URL}/upload/url`, {
                params: { folder: UPLOAD_FOLDER_ID },
            });
            const uploadUrl = urlResponse.data.url;

            if (!uploadUrl) {
                fs.unlinkSync(uploadFilePath);
                return NextResponse.json({ message: 'Failed to obtain upload URL' }, { status: 500 });
            }

            // 2. Stream the assembled file to the media server
            const finalFormData = new FormData();
            finalFormData.append('file', fs.createReadStream(uploadFilePath), fileName);

            try {
                const uploadResponse = await axios.post(uploadUrl, finalFormData, {
                    headers: finalFormData.getHeaders(),
                    maxContentLength: Infinity,
                    maxBodyLength: Infinity,
                });

                // 3. Clean up
                fs.unlinkSync(uploadFilePath);

                if (uploadResponse.data.status !== 200) {
                    throw new Error(uploadResponse.data.msg || "Video upload failed");
                }

                return NextResponse.json({ 
                    completed: true, 
                    videoId: uploadResponse.data.result.id 
                });

            } catch (uploadError) {
                console.error("Failed to upload assembled file:", uploadError);
                fs.unlinkSync(uploadFilePath);
                return NextResponse.json({ message: 'Failed to upload to media server' }, { status: 500 });
            }
        }

        return NextResponse.json({ 
            message: `Chunk ${chunkIndex + 1}/${totalChunks} received`,
            completed: false
        });

    } catch (error) {
        console.error("Chunk upload error:", error);
        return NextResponse.json({ message: 'Server error during chunk upload' }, { status: 500 });
    }
}
