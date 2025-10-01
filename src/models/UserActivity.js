import mongoose from "mongoose";

const userActivitySchema = new mongoose.Schema(
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
    interactionType: {
      type: String,
      enum: ["view", "like"],
      required: true,
    },
  },
  { timestamps: true }
);

userActivitySchema.index(
  { userId: 1, videoId: 1, interactionType: 1 },
  { unique: true }
);

const UserActivity =
  mongoose.models.UserActivity ||
  mongoose.model("UserActivity", userActivitySchema);

export default UserActivity;
