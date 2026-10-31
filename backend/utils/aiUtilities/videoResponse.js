export const formatVideoResponse = (videoUrl, thumbnail = "", duration = 0) => {
  return {
    type: "video",
    videoUrl,
    thumbnail,
    duration,
    generatedAt: new Date().toISOString(),
  };
};

export const extractVideoMetadata = (videoUrl) => {
  return {
    videoUrl,
    processed: true,
    timestamp: new Date().toISOString(),
  };
};

