export const buildVideoAggregation = (
  filter = {},
  sortCriteria = { createdAt: -1 }
) => {
  return [
    { $match: filter },
    {
      $addFields: {
        likesCount: { $size: { $ifNull: ["$likes", []] } },
      },
    },
    {
      $lookup: {
        from: "comments",
        localField: "_id",
        foreignField: "video",
        as: "comments",
      },
    },
    {
      $addFields: {
        commentCount: { $size: "$comments" },
      },
    },
    { $sort: sortCriteria },
    {
      $lookup: {
        from: "users",
        localField: "uploader",
        foreignField: "_id",
        as: "uploaderInfo",
      },
    },
    { $unwind: { path: "$uploaderInfo", preserveNullAndEmptyArrays: true } },
    {
      $project: {
        title: 1,
        description: 1,
        fileId: 1,
        thumbnailUrl: 1,
        visibility: 1,
        views: 1,
        createdAt: 1,
        likesCount: 1,
        commentCount: 1,
        likes: 1,
        "uploader.username": "$uploaderInfo.username",
        "uploader._id": "$uploaderInfo._id",
        "uploader.avatar": "$uploaderInfo.avatar",
      },
    },
  ];
};
