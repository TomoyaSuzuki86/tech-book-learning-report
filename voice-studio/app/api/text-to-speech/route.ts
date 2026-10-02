import {
  DEFAULT_TTS_MODEL,
  DEFAULT_VOICE_ID,
  elevenLabsFetchError,
  getApiKey,
  normalizeVoiceSettings,
  toApiVoiceSettings,
} from "../../../lib/elevenlabs";

type Body = {
  text?: unknown;
  voiceId?: unknown;
  voiceSettings?: unknown;
};

export async function POST(request: Request) {
  const apiKey = getApiKey(request);
  if (!apiKey) {
    return Response.json(
      { error: "ElevenLabs APIキーを入力してください。" },
      { status: 401 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "JSON形式が不正です。" }, { status: 400 });
  }

  const text = typeof body.text === "string" ? body.text.trim() : "";
  const voiceId =
    typeof body.voiceId === "string" && body.voiceId.trim()
      ? body.voiceId.trim()
      : DEFAULT_VOICE_ID;

  if (!text) {
    return Response.json(
      { error: "読み上げる文章を入力してください。" },
      { status: 400 },
    );
  }

  const voiceSettings = toApiVoiceSettings(
    normalizeVoiceSettings(body.voiceSettings),
  );

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(
        voiceId,
      )}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          model_id: DEFAULT_TTS_MODEL,
          voice_settings: voiceSettings,
        }),
      },
    );

    if (!response.ok) {
      return elevenLabsFetchError(
        response,
        "読み上げ音声の生成に失敗しました。",
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "読み上げ音声の生成に失敗しました。",
      },
      { status: 502 },
    );
  }
}
