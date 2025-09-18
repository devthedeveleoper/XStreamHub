import mongoose from 'mongoose';
import CATEGORIES from '@/constants/categories';

const videoSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    fileId: {
        type: String,
        required: true,
        unique: true
    },
    thumbnailUrl: {
        type: String,
        required: false
    },
    category: {
        type: String,
        enum: CATEGORIES,
        default: "Other",
    },
    tags: {
        type: [String],
        default: [],
    },
    visibility: {
        type: String,
        enum: ['public', 'unlisted', 'private'],
        default: 'public',
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    views: {
        type: Number,
        default: 0
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
}, { timestamps: true });

videoSchema.index({
    title: 'text',
    description: 'text',
    category: 'text',
    tags: 'text'
});

videoSchema.index({ uploader: 1, createdAt: -1 });
videoSchema.index({ category: 1, views: -1 });
videoSchema.index({ visibility: 1 });


const Video = mongoose.models.Video || mongoose.model('Video', videoSchema);

export default Video;