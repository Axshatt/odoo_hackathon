export const formatAudioResponse = (audioUrl, transcript = "", duration = 0) => {
  return {
    type: "audio",
    audioUrl,
    transcript,
    duration,
    generatedAt: new Date().toISOString(),
  };
};

export const parseVoiceCommand = (transcript = "") => {
  const normalized = transcript.toLowerCase().trim();
  if (normalized.includes("invoice") && normalized.includes("create")) {
    return { action: "CREATE_INVOICE" };
  }
  if (normalized.includes("payment") || normalized.includes("paid")) {
    return { action: "RECORD_PAYMENT" };
  }
  if (normalized.includes("status") || normalized.includes("active")) {
    return { action: "CHECK_STATUS" };
  }
  return { action: "UNKNOWN", text: transcript };
};

