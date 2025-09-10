import mongoose from "mongoose";
import CATEGORIES from "@/constants/categories";

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    fileId: {
      type: String,
      required: true,
      unique: true,
    },
    thumbnailUrl: {
      type: String,
      required: false,
    },
    uploader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
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
    views: {
      type: Number,
      default: 0,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

videoSchema.index({ 
    title: 'text', 
    description: 'text', 
    category: 'text', 
    tags: 'text' 
});

const Video = mongoose.models.Video || mongoose.model("Video", videoSchema);

export default Video;
