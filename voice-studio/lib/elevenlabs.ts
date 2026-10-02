import { ElevenLabsClient, ElevenLabsError } from "@elevenlabs/elevenlabs-js";

export const DEFAULT_TTS_MODEL = "eleven_multilingual_v2";
export const DEFAULT_STS_MODEL = "eleven_multilingual_sts_v2";
export const DEFAULT_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb";

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
