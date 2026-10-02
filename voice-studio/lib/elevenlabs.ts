import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";

export const DEFAULT_TTS_MODEL = "eleven_multilingual_v2";
export const DEFAULT_STS_MODEL = "eleven_multilingual_sts_v2";
export const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

export type VoiceSettingsInput = {
  stability: number;
  similarityBoost: number;
  style: number;
  speed: number;
  useSpeakerBoost: boolean;
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function normalizeVoiceSettings(input: unknown): VoiceSettingsInput {
  const source =
    typeof input === "object" && input !== null
      ? (input as Partial<VoiceSettingsInput>)
      : {};

  return {
    stability: clamp(Number(source.stability ?? 0.5), 0, 1),
    similarityBoost: clamp(Number(source.similarityBoost ?? 0.75), 0, 1),
    style: clamp(Number(source.style ?? 0), 0, 1),
    speed: clamp(Number(source.speed ?? 1), 0.7, 1.2),
    useSpeakerBoost:
      typeof source.useSpeakerBoost === "boolean"
        ? source.useSpeakerBoost
        : true,
  };
}

export function toApiVoiceSettings(settings: VoiceSettingsInput) {
  return {
    stability: settings.stability,
    similarity_boost: settings.similarityBoost,
    style: settings.style,
    speed: settings.speed,
    use_speaker_boost: settings.useSpeakerBoost,
  };
}

export async function elevenLabsFetchError(
  response: Response,
  fallback: string,
) {
  let message = fallback;

  try {
    const data = (await response.json()) as {
      detail?: unknown;
      error?: unknown;
      message?: unknown;
    };

    if (typeof data.detail === "string") message = data.detail;
    else if (
      typeof data.detail === "object" &&
      data.detail !== null &&
      "message" in data.detail &&
      typeof (data.detail as { message?: unknown }).message === "string"
    ) {
      message = (data.detail as { message: string }).message;
    } else if (typeof data.error === "string") message = data.error;
    else if (typeof data.message === "string") message = data.message;
  } catch {
    // Keep the user-facing fallback when ElevenLabs doesn't return JSON.
  }

  return Response.json(
    { error: message },
    { status: response.status >= 400 && response.status < 600 ? response.status : 502 },
  );
}

export function getApiKey(request: Request) {
  return (
    request.headers.get("x-elevenlabs-key")?.trim() ||
    process.env.ELEVENLABS_API_KEY?.trim() ||
    ""
  );
}

export function createClient(request: Request) {
  const apiKey = getApiKey(request);
  if (!apiKey) {
    return {
      client: null,
      response: Response.json(
        { error: "ElevenLabs APIキーを入力してください。" },
        { status: 401 },
      ),
    } as const;
  }

  return {
    client: new ElevenLabsClient({ apiKey }),
    response: null,
  } as const;
}

export function elevenLabsError(error: unknown, fallback: string) {
  if (error instanceof ElevenLabsError) {
    const status =
      error.statusCode !== undefined &&
      error.statusCode >= 400 &&
      error.statusCode < 600
        ? error.statusCode
        : 502;

    return Response.json(
      { error: error.message || "ElevenLabs APIでエラーが発生しました。" },
      { status },
    );
  }

  return Response.json(
    { error: error instanceof Error ? error.message : fallback },
    { status: 502 },
  );
}
