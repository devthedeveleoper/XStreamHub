import mongoose from "mongoose";

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Video",
      required: true,
    },
  },
  { timestamps: true }
);

watchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });

const WatchHistory =
  mongoose.models.WatchHistory ||
  mongoose.model("WatchHistory", watchHistorySchema);

export default WatchHistory;
