import apiClient from "./apiClient";

export interface RecognizeSpeechResponse {
  success: boolean;
  data: {
    text: string;
    language: string;
    audioFileName?: string;
    audioFileSize?: number;
    audioDataSize?: number;
  };
  message: string;
}

export interface RecognizeSpeechRequest {
  audioData: string; // base64 encoded audio
  language?: string; // vi-VN or en-US
}

/**
 * Recognize speech from audio file (multipart/form-data)
 * @param audioFile Audio file (File object)
 * @param language Language code (vi-VN or en-US). Default: vi-VN
 * @returns Transcribed text
 */
export const recognizeSpeechFromFile = async (
  audioFile: File,
  language: string = "vi-VN"
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("audioFile", audioFile);
    formData.append("language", language);

    const response = await apiClient.post<RecognizeSpeechResponse>(
      "/azure-speech/recognize",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success && response.data.data?.text) {
      return response.data.data.text;
    } else {
      throw new Error(response.data.message || "Speech recognition failed");
    }
  } catch (error: any) {
    console.error("Error recognizing speech from file:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Không thể nhận dạng giọng nói. Vui lòng thử lại."
    );
  }
};

/**
 * Recognize speech from base64 audio data
 * @param request Request containing base64 audio data and language
 * @returns Transcribed text
 */
export const recognizeSpeechFromBase64 = async (
  request: RecognizeSpeechRequest
): Promise<string> => {
  try {
    const response = await apiClient.post<RecognizeSpeechResponse>(
      "/azure-speech/recognize-base64",
      request
    );

    if (response.data.success && response.data.data?.text) {
      return response.data.data.text;
    } else {
      throw new Error(response.data.message || "Speech recognition failed");
    }
  } catch (error: any) {
    console.error("Error recognizing speech from base64:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Không thể nhận dạng giọng nói. Vui lòng thử lại."
    );
  }
};

export interface CorrectTranscriptResponse {
  success: boolean;
  data: {
    originalText: string;
    correctedText: string;
    hasChanges: boolean;
  };
  message: string;
}

export interface CorrectTranscriptRequest {
  transcript: string;
}

/**
 * Correct English technical terms in Vietnamese speech transcript using AI
 * Post-processing to fix misrecognized English words
 * @param transcript Original transcript from speech recognition
 * @returns Corrected transcript with English technical terms fixed
 */
export const correctTranscript = async (transcript: string): Promise<string> => {
  try {
    if (!transcript || !transcript.trim()) {
      return transcript;
    }

    const response = await apiClient.post<CorrectTranscriptResponse>(
      "/ai-interview/correct-transcript",
      { transcript }
    );

    if (response.data.success && response.data.data?.correctedText) {
      return response.data.data.correctedText;
    } else {
      throw new Error(response.data.message || "Failed to correct transcript");
    }
  } catch (error: any) {
    console.error("Error correcting transcript:", error);
    // Return original transcript if correction fails
    return transcript;
  }
};

export interface TranscribeWhisperResponse {
  success: boolean;
  data: {
    text: string;
    language: string;
    audioFileName?: string;
    audioFileSize?: number;
    audioDataSize?: number;
  };
  message: string;
}

export interface TranscribeWhisperRequest {
  audioFile: File;
  language?: string; // "vi" or "en"
}

export interface TranscribeWhisperBase64Request {
  audioData: string; // base64 encoded audio
  fileName?: string;
  language?: string; // "vi" or "en"
}

export interface SynthesizeSpeechRequest {
  text: string;
  language?: string;
  voice?: string;
  returnBase64?: boolean; // If true, returns base64 audio (faster, no S3 upload)
  speechRate?: number; // Speech rate multiplier (0.5 = half speed, 1.0 = normal, 1.5 = 1.5x speed, 2.0 = double speed)
}

export interface SynthesizeSpeechResponse {
  success: boolean;
  data: {
    text: string;
    audioUrl: string;
    audioBase64?: string; // Base64 encoded audio (faster)
    voice: string;
    language: string;
  };
  message: string;
}

export const synthesizeSpeech = async (
  request: SynthesizeSpeechRequest
): Promise<SynthesizeSpeechResponse["data"]> => {
  try {
    // Default to base64 for faster response (no S3 upload)
    const requestWithBase64 = {
      ...request,
      returnBase64: request.returnBase64 ?? true,
    };

    const response = await apiClient.post<SynthesizeSpeechResponse>("/speech/synthesize", requestWithBase64);
    if (!response.data.success) {
      throw new Error(response.data.message || "Speech synthesis failed");
    }

    return response.data.data;
  } catch (error: any) {
    console.error("Error synthesizing speech:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Không thể tạo giọng nói từ văn bản. Vui lòng thử lại."
    );
  }
};

/**
 * Transcribe audio using OpenAI Whisper API
 * Better accuracy for mixed languages (Vietnamese + English) compared to Web Speech API
 * @param request Request containing audio file and optional language
 * @returns Transcribed text
 */
export const transcribeWithWhisper = async (
  request: TranscribeWhisperRequest
): Promise<string> => {
  try {
    const formData = new FormData();
    formData.append("audioFile", request.audioFile);
    if (request.language) {
      formData.append("language", request.language);
    }

    const response = await apiClient.post<TranscribeWhisperResponse>(
      "/ai-interview/transcribe-whisper",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (response.data.success && response.data.data?.text) {
      return response.data.data.text;
    } else {
      throw new Error(response.data.message || "Whisper transcription failed");
    }
  } catch (error: any) {
    console.error("Error transcribing with Whisper:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Không thể transcribe audio với Whisper. Vui lòng thử lại."
    );
  }
};

/**
 * Transcribe audio from base64 using OpenAI Whisper API
 * @param request Request containing base64 audio data and optional language
 * @returns Transcribed text
 */
export const transcribeWithWhisperBase64 = async (
  request: TranscribeWhisperBase64Request
): Promise<string> => {
  try {
    const response = await apiClient.post<TranscribeWhisperResponse>(
      "/ai-interview/transcribe-whisper-base64",
      request
    );

    if (response.data.success && response.data.data?.text) {
      return response.data.data.text;
    } else {
      throw new Error(response.data.message || "Whisper transcription failed");
    }
  } catch (error: any) {
    console.error("Error transcribing with Whisper:", error);
    throw new Error(
      error.response?.data?.message ||
        error.message ||
        "Không thể transcribe audio với Whisper. Vui lòng thử lại."
    );
  }
};

