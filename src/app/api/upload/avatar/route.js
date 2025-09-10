import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';

const FREEIMAGE_API_URL = "https://freeimage.host/api/1/upload";

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('avatar');

        if (!file) {
            return NextResponse.json({ message: 'No file provided.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const imageAsBase64 = buffer.toString("base64");

        const freeimageFormData = new FormData();
        freeimageFormData.append('key', process.env.FREEIMAGE_API_KEY);
        freeimageFormData.append('source', imageAsBase64);
        freeimageFormData.append('action', 'upload');

        const response = await axios.post(FREEIMAGE_API_URL, freeimageFormData);

        if (response.data.status_code === 200) {
            return NextResponse.json({ url: response.data.image.url });
        } else {
            throw new Error('Image upload failed');
        }
    } catch (error) {
        console.error("Avatar upload failed:", error);
        return NextResponse.json({ message: 'Avatar upload failed' }, { status: 500 });
    }
}